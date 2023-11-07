import { Component } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { ActivatedRoute } from '@angular/router';
import { SmartLabService } from '../../../service/evp/smartlabs.service';
import * as moment from 'moment';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'ngx-occupiedTimeStatus',
  styleUrls: ['./occupiedTimeStatus.component.scss'],
  templateUrl: './occupiedTimeStatus.component.html',
})

export class OccupiedTimeStatusComponent {

  ngOnInit(): void {
   
    this.getAllEvseIdsOccupiedTimeStats();
  }

  private intotalOccupied = 0;
  private intotalAvailable = 0;
  private byDayOccupied = 0;
  private byDayAvailable = 0;
  private byNightOccupied = 0;
  private byNightAvailable = 0;
  private others = 0;
  private byDayOthers = 0;
  private byNightOthers = 0;
  selectedFilter: string; 
  public selectedArea: string;
  public inputId: string;
  public startDate: string;
  public endDate: string;
  private filteredData;

  params: String[] = [];

  intotalOccupiedoption: any = {};
  intotalAvailableoption: any = {};
  byDayOccupiedoption: any = {};
  byDayAvailableoption: any = {};
  byNightOccupiedoption: any = {};
  byNightAvailableoption: any = {};
  othersOption: any = {};
  byDayOthersoption: any ={};
  byNightOthersoption: any = {};
  allData: any[] = [];

  public printDataKreise: any[] = [];
  public printDataRegierungsbezirk: any[] = [];
  public printDataSingleEvse: any[] = [];
  public printAllEvse: any[] = [];

  themeSubscription: any;


  constructor(private theme: NbThemeService, private apiService: SmartLabService,private route: ActivatedRoute) {
  }
  async ngAfterViewInit() {
    this.route.queryParams
      .subscribe(params => {
        const input = document.getElementById('filterValue') as HTMLInputElement;
        input.value=params.evseID;
      });
  
  }
 
  
  

  async getAllEvseIdsOccupiedTimeStats() {

    
 
   // const selectedDate = (document.getElementById('dateRangeFilter') as any).value.split(' - ');
    this.selectedFilter = 'allEvse'
    //let startDate, endDate;
    let totalDays = 1;

    
    const yesterday = moment().subtract(1, 'days');

  
    const startDate = yesterday.startOf('day').toDate(); 
  
    
    const endDate = yesterday.endOf('day').toDate(); 
  
    this.startDate = startDate.toISOString();
    this.endDate = endDate.toISOString();
  
  
    try {
      const occupiedTimeData = await this.apiService.getChargePointOccupiedTimeTotalRange(this.startDate, this.endDate);
   //   const chartData = await (await this.apiService.getChargePointInfoSummary(this.startDate)).toPromise(); 
   console.log("occupiedTime: ",occupiedTimeData)

      let filteredOccupiedTimeData = occupiedTimeData.filter(datum => new Date(datum.createdAt) >= startDate && new Date(datum.createdAt) <= endDate);
   //   let filteredChartData = chartData.filter(datum => new Date(datum.name) >= startDate && new Date(datum.name) <= endDate);
  
      // if (filteredOccupiedTimeData.length === 0 || filteredChartData.length === 0) {
      //   alert(`Keine Daten gefunden für ${startDate.toISOString()} - ${endDate.toISOString()}`);
      //   return;
      // }
  
      const totalChargePoints = filteredOccupiedTimeData[0].evseIdCount
      console.log("filteredData: ", filteredOccupiedTimeData)

  
      const totalMinutes = 24 * 60  * totalChargePoints;
      const dayMinutes = 11 * 60  * totalChargePoints;
      const nightMinutes = 13 * 60  * totalChargePoints;
  
      let occupiedDayTime = 0;
      let occupiedNightTime = 0;
      let availableDayTime = 0;
      let availableNightTime = 0;
  
      for (let data of filteredOccupiedTimeData) {
        occupiedDayTime += data.occupiedDayTime;
        occupiedNightTime += data.occupiedNightTime;
        availableDayTime += data.availableDayTime;
        availableNightTime += data.availableNightTime;
      }
  
      const occupiedDayNight = occupiedDayTime + occupiedNightTime;
      const availableDayNight = availableDayTime + availableNightTime;
  
      this.intotalOccupied = parseFloat((occupiedDayNight / totalMinutes * 100).toFixed(2));
      this.intotalAvailable = parseFloat((availableDayNight / totalMinutes * 100).toFixed(2));
      this.byDayOccupied = parseFloat((occupiedDayTime / dayMinutes * 100).toFixed(2));
      this.byDayAvailable = parseFloat((availableDayTime / dayMinutes * 100).toFixed(2));
      this.byNightOccupied = parseFloat((occupiedNightTime / nightMinutes * 100).toFixed(2));
      this.byNightAvailable = parseFloat((availableNightTime / nightMinutes * 100).toFixed(2));
      this.others = parseFloat(((totalMinutes - occupiedDayNight - availableDayNight) / totalMinutes *100).toFixed(2));
      this.byDayOthers = parseFloat((100-this.byDayAvailable-this.byDayOccupied).toFixed(2));
      this.byNightOthers = parseFloat((100- this.byNightAvailable-this.byNightOccupied).toFixed(2));
  
      this.printAllEvse.push([
        `${this.startDate}${this.endDate ? '-' + this.endDate : ''}`,
        "Alle EvseId",
        `${this.intotalOccupied}%`,
        `${this.intotalAvailable}%`,
        `${this.others}%`,
        `${this.byDayOccupied}%`,
        `${this.byDayAvailable}%`,
        `${this.byDayOthers}%`,
        `${this.byNightAvailable}%`,
        `${this.byNightOccupied}%`,
        `${this.byNightOthers}%`
      ]);
  
      
    
      this.themeSubscription = this.theme.getJsTheme().pipe(delay(1)).subscribe(config => {
    
        this.intotalOccupiedoption = this.generateCharts(this.intotalOccupied, this.intotalOccupiedoption, config);
    
        this.intotalAvailableoption = this.generateCharts(this.intotalAvailable, this.intotalAvailableoption, config);
    
        this.byDayOccupiedoption = this.generateCharts(this.byDayOccupied, this.byDayOccupiedoption, config);
    
        this.byDayAvailableoption = this.generateCharts(this.byDayAvailable, this.byDayAvailableoption, config);
    
        this.byNightOccupiedoption = this.generateCharts(this.byNightOccupied, this.byNightOccupiedoption, config);
    
        this.byNightAvailableoption = this.generateCharts(this.byNightAvailable, this.byNightAvailableoption, config);
  
        this.othersOption = this.generateCharts(this.others, this.othersOption,config);
  
        this.byDayOthersoption= this.generateCharts(this.byDayOthers, this.byDayOthersoption,config);
  
        this.byNightOthersoption = this.generateCharts(this.byNightOthers, this.byNightOthersoption,config);
      });
     
    } catch (error) {
      console.error('An error occurred while fetching data:', error);
      // Handle the error appropriately.
    }

    const occupiedTimeData = await this.apiService.getChargePointOccupiedTimeTotalRange(startDate.toISOString(),endDate.toISOString());
   

  }

  
  
  
  
  
  

  ngOnDestroy() {
   /*  this.themeSubscription.unsubscribe(); */
  }

  generateCharts(value, option, config) {

    if (!isFinite(value) || isNaN(value)) {
      value = 0;
    }

    const solarTheme: any = config.variables.solar;

    option = Object.assign({}, {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
      },
      series: [
        {
          name: ' ',
          clockWise: true,
          hoverAnimation: false,
          type: 'pie',
          center: ['45%', '50%'],
          radius: solarTheme.radius,
          data: [
            {
              value: value,
              name: ' ',
              label: {
                normal: {
                  position: 'center',
                  formatter: '{d}%',
                  textStyle: {
                    fontSize: '10',
                    fontFamily: config.variables.fontSecondary,
                    fontWeight: '300',
                    color: config.variables.fgHeading,
                  },
                },
              },
              tooltip: {
                show: false,
              },
              itemStyle: {
                normal: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                    //  color: 'rgba(0,111,122,0.5)',
                    color: 'rgba(220,189,35)',
                    },
                    {
                      offset: 1,
                    //  color: 'rgba(0,137,131,0.5)',
                    color: 'rgba(220,189,35)',
                    },
                  ]),
                  shadowColor: solarTheme.shadowColor,
                  shadowBlur: 0,
                  shadowOffsetX: 0,
                  shadowOffsetY: 3,
                },
              },
              hoverAnimation: false,
            },
            {
              value: 100 - value,
              name: ' ',
              tooltip: {
                show: false,
              },
              label: {
                normal: {
                  position: 'inner',
                },
              },
              itemStyle: {
                normal: {
                  color: solarTheme.secondSeriesFill,
                },
              },
            },
          ],
        }
      ],
    });

    return option;
  }


  


}

