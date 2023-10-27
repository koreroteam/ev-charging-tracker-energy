import { AfterViewInit, Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { ActivatedRoute, Router } from '@angular/router';
import { SmartLabService } from '../../../service/evp/smartlabs.service';
import * as moment from 'moment';
import { delay, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { Observable } from 'rxjs';
import * as turf from '@turf/turf';

@Component({
  selector: 'ngx-occupiedTimeLine',
  styleUrls: ['./occupiedTimeLine.component.scss'],
  templateUrl: './occupiedTimeLine.component.html',
})

export class OccupiedTimeLineComponent implements OnInit {
 
  constructor(private theme: NbThemeService, private apiService: SmartLabService) {
    this.themeSubscription = this.theme.getJsTheme().subscribe(config => {
      const colors: any = config.variables;
      // this.colorScheme = {
      //   domain: [colors.primaryLight, colors.infoLight, colors.successLight, colors.warningLight, colors.dangerLight],
      // };
    });

    
  }


  async ngOnInit() {
    this.selectedFilter = 'allEvse';


  await this.getLast7DaysData([], true, false);
    
  }

  results: any[];
  selectedFilter: string; 
  public selectedArea: string;
  
  public startDate: string;
  public endDate: string;

  public printDataKreise: any[] = [];
  public printDataRegierungsbezirk: any[] = [];
  public printDataSingleEvse: any[] = [];
  public printAllEvse: any[] = [];

  showLegend:boolean = true;
  showXAxis = true;
  showYAxis = true;
  xAxisLabel = 'Datum';
  yAxisLabel = 'Belegungszeit in Minuten';
  legendTitle = 'EvseID'
  // colorScheme: any;
  themeSubscription: any;
  params: String[] = [];
  powerType: any;
  region: any;
  showInput: any = '#';
  colorScheme = {
    domain: ['#0068af', '#576874', '#46aa28', '#99c200', '#003457']
  };

  //filterForm = new FormControl('');
  chartData: any[] = [];
  public evseIdInput: String



  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }

  async getLast7DaysData(evseIds: string[], allEvseIds: boolean = false, area: boolean = false) {
    let endDate = moment().subtract(1, 'days').format('YYYY-MM-DD'); 
    let startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
    this.startDate= startDate;
    this.endDate=endDate;
  
    
    const dateRangeInput = document.getElementById('dateRangeFilter') as HTMLInputElement;
    if (dateRangeInput && dateRangeInput.value) {
      const [start, end] = dateRangeInput.value.split(' - ');
      startDate = moment(start, 'MMM D, YYYY').format('YYYY-MM-DD');
      endDate = moment(end, 'MMM D, YYYY').format('YYYY-MM-DD');
      this.startDate= startDate;
      this.endDate=endDate;
    }
    
    const datesInRange = [];
    
    for (let currentDate = moment(startDate); currentDate.isSameOrBefore(endDate); currentDate.add(1, 'day')) {
      datesInRange.push(currentDate.format('YYYY-MM-DD'));
    }
    
    try {
      let data: any[];
  
      if (allEvseIds) {
        data = await this.apiService.getChargePointOccupiedTimeTotalRange(startDate, endDate);
    } else if (area) {
        if (this.selectedFilter === 'regierungsbezirke') {
            data = await this.apiService.getChargePointOccupiedTimeBezirk(startDate, endDate, this.selectedArea);
        } else if (this.selectedFilter === 'kreise') {
            data = await this.apiService.getChargePointOccupiedTimeKreis(startDate, endDate, this.selectedArea);
        }
    } else {
        data = await Promise.all(evseIds.map(evseId => this.apiService.getChargePointOccupiedTime(evseId, startDate)));
    }
    
    let seriesData;
    if (allEvseIds) {
        seriesData = this.processDataForAllEvseIds(data, datesInRange);
    } else if (area) {
        seriesData = this.processDataForArea(data, datesInRange, this.selectedFilter);
    } 
  
      this.chartData = seriesData;
  
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  processDataForArea(data:any[],datesInRange:string[],selectedArea: string){
    let seriesData = [];
   

 
    
    datesInRange.forEach(date => {
      console.log(date)
      let totalOccupiedTime = 0;
      data.forEach(item => {

       
      if(this.selectedFilter === 'regierungsbezirke'){
        if (item.formattedDate === date && item.administrativeArea === this.selectedArea) {

          totalOccupiedTime += item.totalOccupiedDaytime + item.totalOccupiedNighttime;
          this.printDataRegierungsbezirk.push([
            date,
            this.selectedArea,
            totalOccupiedTime
          ]);
      
        }
            
      }else if(this.selectedFilter === 'kreise'){
     //  console.log(item)
        if (item.formattedDate === date && item.administrativeAreaLevel3 === this.selectedArea) {
         // console.log('totalOccupiedDaytime:', item.totalOccupiedDaytime, 'totalOccupiedNightTime:', item.totalOccupiedNightTime);
          totalOccupiedTime += item.totalOccupiedDaytime + item.totalOccupiedNighttime;
          this.printDataKreise.push([
            date,
            this.selectedArea,
            totalOccupiedTime
          ]);
               }
      }
      
    });
  

   
      seriesData.push({
        name: date,
        value: totalOccupiedTime
      });
    });
    
    
    console.log('seriesData:', seriesData);
    
    return [{
      name: 'Total Occupied Time',
      series: seriesData
    }];

  }
  
  processDataForAllEvseIds(data: any[], datesInRange: string[]) {
   
    this.selectedFilter = "allEvse"
    let seriesData = [];

    
    
    datesInRange.forEach(date => {
      let totalOccupiedTime = 0;
      data.forEach(item => {
   
      
        if (item.formattedDate === date) {
          totalOccupiedTime += item.occupiedDayTime + item.occupiedNightTime;
          this.printAllEvse.push([
            date,
            "Alle EvseID",
            totalOccupiedTime
          ]);
        }
        
      });
      
      seriesData.push({
        name: date,
        value: totalOccupiedTime
      });
    });
    
    

    
    return [{
      name: 'Total Occupied Time',
      series: seriesData
    }];
  }
  
  
  
  
  
  
  
  
  
  }
