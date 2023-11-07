import { Component, OnInit,  NgModule } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { SmartLabService } from '../../service/evp/smartlabs.service';
import * as htmlToImage from 'html-to-image';
import {UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import * as moment from 'moment';
import { forkJoin, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';





@Component({
  selector: 'ngx-charging-infra-point-month-charts',
  templateUrl: './charging-infra-point-month-charts.component.html',
  styleUrls: ['./charging-infra-point-month-charts.component.scss']
})
export class ChargingInfraPointMonthChartsComponent implements OnInit {
 

  constructor(private theme: NbThemeService, private apiService: SmartLabService) {
    this.themeSubscription = this.theme.getJsTheme().subscribe(config => {
      const colors: any = config.variables;
      // this.colorScheme = {
      //   domain: [colors.primaryLight, colors.infoLight, colors.successLight, colors.warningLight, colors.dangerLight],
      // };
    });

    
  }


  async ngOnInit() {
    const startMonth = moment().subtract(5, 'months').startOf('month');
    const endMonth = moment().endOf('month');
    this.monthRangeForm.setValue({ startMonth: startMonth.format('YYYY-MM'), endMonth: endMonth.format('YYYY-MM') });
  
    this.getChargepointGraph();
    this.updateChartData();
  }
  

  results: any[];
  selectedFilter: string;
  selectedFilterValue: string = '';

  showLegend:boolean = true;
  showXAxis = true;
  showYAxis = true;
  xAxisLabel = 'Dates';
  yAxisLabel = 'NumberOfStations';
  legendTitle = 'Leistungsklasse'
  // colorScheme: any;
  themeSubscription: any;
  params: String[] = [];
  powerType: any;
  region: any;
  showInput: any = '#';
  colorScheme = {
    domain: ['#006F7A', '#00877F', '#DCBD23']
  };

  filterForm = new UntypedFormControl('');
  filterValue: any;

  
 

  monthRangeForm = new UntypedFormGroup({
    startMonth: new UntypedFormControl(''),
    endMonth: new UntypedFormControl(''),
  });

  onSubmit() {
    this.updateChartData();
  }
  
  
  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }


  
  async getChargepointGraph(param?: string) {
    if (!param) {
      param = this.buildparams();
    }
  
    const startMonth = this.monthRangeForm.get('startMonth').value;
    const endMonth = this.monthRangeForm.get('endMonth').value;
    const startDateForComparison = moment(startMonth, 'YYYY-MM');
    const endDateForComparison = moment(endMonth, 'YYYY-MM');
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
  
    if (startDateForComparison.isBefore(april20_2023, 'month') && (!endMonth || endDateForComparison.isBefore(april20_2023, 'month'))) {
      console.log('Fetching data before April 20, 2023');
      (await this.apiService.getCharttData(param)).subscribe(data => {
        this.processData(data);
      });
    } else if (startDateForComparison.isBetween(april20_2023, june29_2023, 'month', '[]') && (!endMonth ||       endDateForComparison.isBetween(april20_2023,  june29_2023, 'month', '[]'))) {
      console.log('Fetching data between April 20, 2023 and June 28, 2023');
      (await this.apiService.getCharttDataApril(param)).subscribe(data => {
        this.processData(data);
      });
    } else if (startDateForComparison.isSameOrAfter(june29_2023, 'month') && (!endMonth || endDateForComparison.isSameOrAfter(june29_2023, 'month'))) {
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
    let normalCharging = {};
    let SchnellCharging = {};
    let hpcCharging = {};
    let lastDayOfMonth = {};
    let latestData = {};
    const today = moment();
    data.forEach(element => {
      if (!element.name) return; // Add this line to check if the 'name' property exists before processing
      
      const date = moment(element.name, 'YYYY-MM-DD');
      const month = date.format('MMM');
      const lastDayOfMonthMoment = moment(date).endOf('month');
      if (date.isSame(lastDayOfMonthMoment, 'day')) {
        lastDayOfMonth[month] = {
          normalCharging: element.normalCharging,
          SchnellCharging: element.schnellCharging,
          hpcCharging: element.hpcCharging,
        };
      } else if (date.isSame(today, 'month')) {
        if (!latestData[month] || date.isAfter(latestData[month].date)) {
          latestData[month] = {
            normalCharging: element.normalCharging,
            SchnellCharging: element.schnellCharging,
            hpcCharging: element.hpcCharging,
            date: date,
          };
        }
      }
      normalCharging[month] = (normalCharging[month] || 0) + element.normalCharging;
      SchnellCharging[month] = (SchnellCharging[month] || 0) + element.schnellCharging;
      hpcCharging[month] = (hpcCharging[month] || 0) + element.hpcCharging;
    });
  
    let chartData = [];
    Object.keys(lastDayOfMonth).forEach(month => {
      chartData.push({
        name: month,
        series: [
          {
            name: 'AC',
            value: lastDayOfMonth[month].normalCharging
          },
          {
            name: 'DC',
            value: lastDayOfMonth[month].SchnellCharging
          },
          {
            name: 'HPC',
            value: lastDayOfMonth[month].hpcCharging
          }
        ]
      });
    });
  
    Object.keys(latestData).forEach(month => {
      if (chartData.findIndex(item => item.name === month) === -1) {
        chartData.push({
          name: month,
          series: [
            {
              name: 'AC',
              value: latestData[month].normalCharging
            },
            {
              name: 'DC',
              value: latestData[month].SchnellCharging
            },
            {
              name: 'HPC',
              value: latestData[month].hpcCharging
            }
          ]
        });
      }
    });
  
    const endDate = moment(data[data.length - 1].name, 'YYYY-MM-DD').format('MMM D, YYYY');
    const xAxisLabel = `Dates (${endDate})`;
  
    this.results = chartData;
    this.xAxisLabel = xAxisLabel;
  }
  
  async updateChartData() {
    const { startMonth, endMonth } = this.monthRangeForm.value;
    const startDate = startMonth ? moment(startMonth).startOf('month').format('YYYY-MM-DD') : null;
    const endDate = endMonth ? moment(endMonth).endOf('month').format('YYYY-MM-DD') : null;
  
    this.params = [];
    if (this.powerType && this.powerType != '#') {
      this.params.push('powerRange=' + this.powerType);
    }
    if (this.region && this.filterValue) {
      this.params.push(this.region + '=' + this.filterValue); 
    }
    if (startDate && endDate) {
      this.params.push(`startDate=${startDate}&endDate=${endDate}`);
    }
  
    const param = this.params.join("&");
    this.getChargepointGraph(param);
  }
  


changePowerFilter(data) {
  this.powerType = data;
 this.updateChartData();
}

changeRegion(data) {
  this.region = data;
  const input = document.getElementById('filterValue') as HTMLInputElement;
  this.filterValue = input.value;
  input.value = null;
  if (this.region == '#') {
    this.region = null;
  }
  this.updateChartData();
}

  


    buildparams() {
      this.params = [];
      const input = document.getElementById('filterValue') as HTMLInputElement | null;
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
      return this.params.join("&");
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
