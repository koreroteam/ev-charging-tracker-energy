import {Component, OnDestroy, OnInit} from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { takeWhile } from 'rxjs/operators' ;
import { SolarData } from '../../@core/data/solar'
import { SmartLabService } from '../../service/evp/smartlabs.service';
import * as moment from 'moment';
import { from } from 'rxjs';
;

interface CardSettings {
  title: string;
  iconClass: string;
  type: string;
  dataValue?: number; 
  powerValue?: number
}

@Component({
  selector: 'ngx-dashboard',
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnDestroy, OnInit {

  private alive = true;
  anzahlLadepunkteData: number;
  leistungLadepunkteData: number;

  solarValue: number;
  totalNumberCard: CardSettings = {
    title: 'Anzahl der Ladepunkte erhöht',
    iconClass: 'bar-chart-outline',
    type: 'primary',
   
   
  };
  totalPowerCard: CardSettings = {
    title: 'Leistung der Ladepunkte erhöht',
    iconClass: 'bar-chart-outline',
    type: 'success',
    
  };
  totalOccupiedTimeCard: CardSettings = {
    title: 'Änderung der Belegungszeit',
    iconClass: 'activity-outline',
    type: 'info',
    
  };
 

  statusCards: string;

  commonStatusCardsSet: CardSettings[] = [
    this.totalNumberCard,
    this.totalPowerCard,
    this.totalOccupiedTimeCard,
    
  ];

  statusCardsByThemes: {
    default: CardSettings[];
    cosmic: CardSettings[];
    corporate: CardSettings[];
    dark: CardSettings[];
  } = {
    default: this.commonStatusCardsSet,
    cosmic: this.commonStatusCardsSet,
    corporate: [
      {
        ...this.totalNumberCard,
        type: 'warning',
      },
      {
        ...this.totalPowerCard,
        type: 'primary',
      },
      {
        ...this.totalOccupiedTimeCard,
        type: 'danger',
      },
      
    ],
    dark: this.commonStatusCardsSet,
  };

  constructor(private themeService: NbThemeService,
              private solarService: SolarData,
              private apiService: SmartLabService,
              ) {
    this.themeService.getJsTheme()
      .pipe(takeWhile(() => this.alive))
      .subscribe(theme => {
        this.statusCards = this.statusCardsByThemes[theme.name];
    });


    this.solarService.getSolarData()
      .pipe(takeWhile(() => this.alive))
      .subscribe((data) => {
        this.solarValue = data;
      });
      
  }
  

  async getTodaysData() {
    try {
      const today = moment().format('YYYY-MM-DD'); 
      const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
      const param = `startDate=${yesterday}&endDate=${today}`;
      console.log(param)

      const occupiedTimeData =  await this.apiService.getChargePointOccupiedTimeTotalRange(yesterday,today);
      const data =  await (await this.apiService.getCharttDataCombined(param)).toPromise();

      console.log("occupiedTimeData: ",occupiedTimeData)

    
      if (data && data.length > 0) {
        const yesterdayOccupied = occupiedTimeData[0]
        const todayOccupied = occupiedTimeData[1]
        const yesterdayData = data[0];
        const todayData = data[1]; 

        const yesterdayValue = +yesterdayData.value;
        const todayValue = +todayData.value;
        const yesterdayValuePower = yesterdayData.totalPower;
        const todayPower = todayData.totalPower;

        const yesterdayTotalOccupied = yesterdayOccupied.occupiedDayTime + yesterdayOccupied.occupiedNightTime ;
        const todayTotalOccupied = todayOccupied.occupiedDayTime + todayOccupied.occupiedNightTime;

        console.log("today's data: ",todayData)
        console.log("value: ",todayData.value)
        console.log("power: ",todayData.totalPower)

       
       
        const difference = todayValue - yesterdayValue;
        console.log("difference: ", difference)
        const differencePower = todayPower - yesterdayValuePower;
        console.log("differencePower: ", differencePower)
        const differenceOccupied = todayTotalOccupied - yesterdayTotalOccupied;
        console.log("differenceOccupied: ", differenceOccupied)

    console.log("Difference:", difference);

    
    this.totalNumberCard = {
      ...this.totalNumberCard, 
      dataValue: difference,
    }
       
        this.totalPowerCard = {
          ...this.totalPowerCard,
         powerValue: differencePower,
        };

        this.totalOccupiedTimeCard = {
          ...this.totalOccupiedTimeCard,
         powerValue:differenceOccupied,
        };
      } else {
        console.log('No data available for today.');
      }
    } catch (error) {
      console.error('An error occurred while fetching today\'s data:', error);
    }
  }

  ngOnInit() {
    this.getTodaysData(); // Fetch the data when the component initializes
  }
  

  ngOnDestroy() {
    this.alive = false;
  }
}
