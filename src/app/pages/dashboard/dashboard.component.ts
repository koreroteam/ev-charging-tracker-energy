import {Component, OnDestroy, OnInit,ElementRef, HostListener } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { takeWhile } from 'rxjs/operators' ;
import { SolarData } from '../../@core/data/solar'
import { SmartLabService } from '../../service/evp/smartlabs.service';
import * as moment from 'moment';
import { from } from 'rxjs';
import { NbMenuItem } from '@nebular/theme';

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
  public startDate: string;
  public endDate: string;

  solarValue: number;

  private prevScrollpos = window.pageYOffset;
  
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
              private el: ElementRef,
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


      const yesterdayData = moment().subtract(2, 'days');
      const todayData =  moment().subtract(1, 'days');
      const startDateData = yesterdayData.startOf('day').toDate(); 
      const endDateData = todayData.startOf('day').toDate(); 
    
      this.startDate = startDateData.toISOString();
      this.endDate = endDateData.toISOString();


      const param = `startDate=${yesterday}&endDate=${today}`;
      console.log(param)

      const occupiedTimeData =  await this.apiService.getChargePointOccupiedTimeTotalRange(yesterday,today);
      let filteredOccupiedTimeData = occupiedTimeData.filter(datum => new Date(datum.createdAt) >= startDateData && new Date(datum.createdAt) <= endDateData);
      console.log(filteredOccupiedTimeData)
      const data =  await (await this.apiService.getCharttDataCombined(param)).toPromise();

      console.log("occupiedTimeData: ",occupiedTimeData)

    
      if (data && data.length > 0) {
        const yesterdayOccupied = filteredOccupiedTimeData[0]
        console.log("yesterdayData:", yesterdayOccupied)
        
        const todayOccupied = filteredOccupiedTimeData [1]
        console.log("todayData:", todayOccupied)
        const yesterdayData = data[0];
        const todayData = data[1]; 

        const yesterdayValue = +yesterdayData.value;
        const todayValue = +todayData.value;
        const yesterdayValuePower = yesterdayData.totalPower;
        const todayPower = todayData.totalPower;

        const yesterdayTotalOccupied = yesterdayOccupied.occupiedDayTime + yesterdayOccupied.occupiedNightTime ;
        const todayTotalOccupied = todayOccupied.occupiedDayTime + todayOccupied.occupiedNightTime;
        // console.log("yesterday occupied Daytime:",yesterdayOccupied.occupiedDayTime)
        // console.log("yesterday occupied nighttime:",yesterdayOccupied.occupiedNightTime)
        // console.log("today occupied Daytime:",todayOccupied.occupiedDayTime)
        // console.log("today occupied nighttime:",todayOccupied.occupiedNightTime)

        // console.log("today's data: ",todayData)
        // console.log("value: ",todayData.value)
        // console.log("power: ",todayData.totalPower)

       
       
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

  @HostListener('window:scroll', [])
  onWindowScroll() {
    console.log("mouse move")
    const currentScrollPos = window.pageYOffset;
    if (this.prevScrollpos > currentScrollPos) {
      this.el.nativeElement.style.top = '0';
    } else {
      this.el.nativeElement.style.top = '-120px'; // Adjust this value to match the height of your navbar
    }
    this.prevScrollpos = currentScrollPos;
  }
}
