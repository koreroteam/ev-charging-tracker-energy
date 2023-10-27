import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { NbThemeService } from '@nebular/theme';
import * as moment from 'moment';
import * as htmlToImage from 'html-to-image';
import { SmartLabService } from '../../service/evp/smartlabs.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'ngx-charging-infra-point-power-charts',
  templateUrl: './charging-infra-point-power-charts.component.html',
  styleUrls: ['./charging-infra-point-power-charts.component.scss'],
})

export class ChargingInfraPointPowerChartsComponent implements OnInit{
  
  constructor(private theme: NbThemeService, private apiService: SmartLabService) {
    this.themeSubscription = this.theme.getJsTheme().subscribe((config) => {
      const colors: any = config.variables;
      
    });
  }

  async ngOnInit() {
    
    this.getLast7DaysData();
  }

 

  results: any[] = [];
  showLegend = true;
  showXAxis = true;
  showYAxis = true;
  xAxisLabel = 'Dates';
  yAxisLabel = 'Total Power';
  legendTitle = 'Leistungsklasse'
  colorScheme = {
    domain: ['#46aa28', '#0068af', '#c20000'],
  };
  themeSubscription: any;
  filterForm = new UntypedFormControl('');
  params: String[] = [];
  powerType: any;
  region: any;
  startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
  endDate = moment().format('YYYY-MM-DD');
  showInput: string = '#';
  selectedFilter: string;
  selectedFilterValue: string = '';

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }

  async getLast7DaysData() {
    this.endDate = moment().format('YYYY-MM-DD');
    this.startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
    const param = `startDate=${this.startDate}&endDate=${this.endDate}`;
    
    const data = await (await this.apiService.getCharttDataCombined(param)).toPromise();
    this.processData(data);
}

  async getChargepointGraph() {
    const param = this.buildparams();
    const endDateForComparison = moment(this.endDate, 'YYYY-MM-DD');
    const startDateForComparison = moment(this.startDate, 'YYYY-MM-DD');
    const april20_2023 = moment('2023-04-20', 'YYYY-MM-DD');
    const june29_2023 = moment('2023-06-29', 'YYYY-MM-DD')

  
    const paramObj = (paramString: string) => {
      const obj: any = {};
      paramString.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        obj[key] = value;
      });
      return obj;
    };

  
    const paramStr = (paramObj: any) => {
      return Object.entries(paramObj).map(([key, value]) => `${key}=${value}`).join('&');
    };

    const currentParamObj = paramObj(param);
  
    if (startDateForComparison.isBefore(april20_2023, 'day') && (!this.endDate || endDateForComparison.isBefore(april20_2023, 'day'))) {
      console.log('Fetching data before April 20, 2023');
      (await this.apiService.getCharttData(param)).subscribe(data => {
        this.processData(data);
      });
    } else if (startDateForComparison.isBetween(april20_2023, june29_2023, 'day', '[]') && (!this.endDate ||       endDateForComparison.isBetween(april20_2023,  june29_2023, 'day', '[]'))) {
      console.log('Fetching data between April 20, 2023 and June 28, 2023');
      (await this.apiService.getCharttDataApril(param)).subscribe(data => {
        this.processData(data);
      });
    } else if (startDateForComparison.isSameOrAfter(june29_2023, 'day') && (!this.endDate || endDateForComparison.isSameOrAfter(june29_2023, 'day'))) {
      console.log('Fetching data on or after June 29, 2023');
      (await this.apiService.getCharttDataJune(param)).subscribe(data => {
        this.processData(data);
      });
    } else {
      // Handle cross data
      console.log('Fetching cross data');
      const oldData$ = (await this.apiService.getCharttData(paramStr({ ...currentParamObj, endDate: april20_2023.clone().subtract(1, 'days').format('YYYY-MM-DD') }))).pipe(map(response => response));
      const aprilData$ = (await this.apiService.getCharttDataApril(paramStr({ ...currentParamObj }))).pipe(map(response => response));
      const juneData$ = (await this.apiService.getCharttDataJune(paramStr({ ...currentParamObj }))).pipe(map(response => response));
  
      forkJoin([oldData$, aprilData$, juneData$]).subscribe(([oldData, aprilData, juneData]: [any[], any[], any[]]) => {
        const combinedData = oldData.concat(aprilData).concat(juneData);
        this.processData(combinedData);
      });
    }
  }

  

  processData(data) {

    const param = this.buildparams();
    
   
      let acTotalPower = [];
      let dcTotalPower = [];
      let hpcTotalPower = [];  
      let date =[];

      data.forEach(element => {
        acTotalPower.push(Math.round(element.acTotalPower/100) /10 );
        dcTotalPower.push(Math.round(element.dcTotalPower/100)/10);
        hpcTotalPower.push(Math.round(element.hpcTotalPower/100)/10);
        date.push(moment(element.name, 'YYYY-MM-DD').format('MMM D'));   
      });
    
     let chartData = [];
     for (let i = 0; i < date.length; i++) {
      chartData.push({
        name: date[i],
        series: [
          {
            name: 'AC',
            value: acTotalPower[i]
          },
        
          {
            name: 'DC',
            value: dcTotalPower[i]
          },
          {
            name: 'HPC',
            value: hpcTotalPower[i]
          }
        ]
      });
    }

    this.results = chartData;
    console.log(this.results);
  

    
  }


  buildparams() {
    this.params = [];
    const input = document.getElementById('filterValue') as HTMLInputElement | null;
    const dateRange = document.getElementById('dateRangeFilter') as HTMLInputElement | null;
    let filterValue: string;
    if (this.selectedFilter === 'regierungsbezirk') {
      filterValue = this.selectedFilterValue; // from nb-select
    } else {
      const input = document.getElementById('filterValue') as HTMLInputElement | null;
      filterValue = input ? input.value : ''; // from input element
    }
  
  
    if (this.powerType && this.powerType!='#' ) {
      this.params.push('powerRange=' + this.powerType);
    }
    if (this.region) {
      this.params.push(this.region + '=' + filterValue);
    }
    if (dateRange) {
      this.startDate = moment(dateRange.value.substring(0, 13), 'MMM D, YYYY').format('YYYY-MM-DD');
      this.endDate = moment(dateRange.value.substring(14, 30), 'MMM DD, YYYY').format('YYYY-MM-DD');
    }
    if (!this.startDate.includes("Invalid") && !this.endDate.includes("Invalid")) {    
      this.params.push('startDate='+this.startDate);
      this.params.push('endDate='+this.endDate);
    }
    return this.params.join("&");
  }


  changePowerFilter(data) {
    this.powerType = data;
    this.getChargepointGraph();
  }

  changeRegion(data) {
    this.region = data;
    const input = document.getElementById('filterValue') as HTMLInputElement;
    input.value = null;
    if (this.region == '#') {
      this.region = null;
    }
    this.getChargepointGraph();
  }

  downloadImage(type: any) {
    var node = document.getElementById('print');
    htmlToImage.toJpeg(node, { quality: 0.95 })
      .then(function (dataUrl) {
        var link = document.createElement('a');
        if (type == 'jpeg') {
          link.download = 'charts' + Date.now() + '.jpeg';
        }
        else {
          link.download = 'charts' + Date.now() + '.png';
        }
        link.href = dataUrl;
        link.click();
      });
  }
   
  }