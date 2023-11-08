import { Component, OnInit, OnDestroy } from '@angular/core';
import {UntypedFormGroup,  UntypedFormControl } from '@angular/forms';
import { NbThemeService } from '@nebular/theme';
import * as moment from 'moment';
import * as htmlToImage from 'html-to-image';
import { SmartLabService } from '../../service/evp/smartlabs.service';
import { forkJoin, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

@Component({
  selector: 'ngx-charging-infra-point-power-month-charts',
  templateUrl: './charging-infra-point-power-month-charts.component.html',
  styleUrls: ['./charging-infra-point-power-month-charts.component.scss'],
})

export class ChargingInfraPointPowerMonthChartsComponent implements OnInit{
  
  constructor(private theme: NbThemeService, private apiService: SmartLabService) {
    this.themeSubscription = this.theme.getJsTheme().subscribe((config) => {
      const colors: any = config.variables;
      
    });
  }

  async ngOnInit() {
    const startMonth = moment().subtract(5, 'months').startOf('month');
    const endMonth = moment().endOf('month');
    this.monthRangeForm.setValue({ startMonth: startMonth.format('YYYY-MM'), endMonth: endMonth.format('YYYY-MM') });
  
    this.getChargepointGraph();
    this.updateChartData();
  }

  selectedFilter: string;
  selectedFilterValue: string = '';

  results: any[] = [];
  showLegend = true;
  showXAxis = true;
  showYAxis = true;
  xAxisLabel = 'Dates';
  yAxisLabel = 'Total Power';
  legendTitle = 'Leistungsklasse'
  colorScheme = {
    domain: ['#006F7A', '#00877F', '#DCBD23']
  };

  themeSubscription: any;
  filterForm = new UntypedFormControl('');
  params: String[] = [];
  powerType: any;
  region: any;
  startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
  endDate = moment().format('YYYY-MM-DD');
  showInput: string = '#';

  monthRangeForm = new UntypedFormGroup({
    startMonth: new UntypedFormControl(''),
    endMonth: new UntypedFormControl(''),
  });
  filterValue: any;

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }

  onSubmit() {
    this.updateChartData();
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
    } else if (startDateForComparison.isBetween(april20_2023, june29_2023, 'month', '[]') && (!endMonth ||     endDateForComparison.isBetween(april20_2023,  june29_2023, 'month', '[]'))) {
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
    let acTotalPower = {};
    let dcTotalPower = {};
    let hpcTotalPower = {};
    let lastDayOfMonth = {};
    let latestData = {};
    const today = moment();
  
    data.forEach(element => {
      const date = moment(element.name, 'YYYY-MM-DD');
      const month = date.format('MMM');
      const lastDayOfMonthMoment = moment(date).endOf('month');
  
      if (date.isSame(lastDayOfMonthMoment, 'day')) {
        lastDayOfMonth[month] = {
          acTotalPower: element.acTotalPower,
          dcTotalPower: element.dcTotalPower,
          hpcTotalPower: element.hpcTotalPower,
        };
      } else if (date.isSame(today, 'month')) {
        if (!latestData[month] || date.isAfter(latestData[month].date)) {
          latestData[month] = {
            acTotalPower: element.acTotalPower,
            dcTotalPower: element.dcTotalPower,
            hpcTotalPower: element.hpcTotalPower,
            date: date,
          };
        }
      }
  
      acTotalPower[month] = (acTotalPower[month] || 0) + element.acTotalPower;
      dcTotalPower[month] = (dcTotalPower[month] || 0) + element.dcTotalPower;
      hpcTotalPower[month] = (hpcTotalPower[month] || 0) + element.hpcTotalPower;
    });
  
    let chartData = [];
    Object.keys(lastDayOfMonth).forEach(month => {
      chartData.push({
        name: month,
        series: [
          {
            name: 'AC',
            value: Math.round(lastDayOfMonth[month].acTotalPower/100)/10
          },
          {
            name: 'DC',
            value: Math.round(lastDayOfMonth[month].dcTotalPower/100)/10
          },
          {
            name: 'HPC',
            value: Math.round(lastDayOfMonth[month].hpcTotalPower/100)/10
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
              value: Math.round(latestData[month].acTotalPower/100)/10
            },
            {
              name: 'DC',
              value: Math.round(latestData[month].dcTotalPower/100)/10
            },
            {
              name: 'HPC',
              value: Math.round(latestData[month].hpcTotalPower/100)/10
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
      
      this.params.push(`${this.region}=${filterValue}`);
    }
    return this.params.join("&");
    }




async updateChartData() {
  const { startMonth, endMonth } = this.monthRangeForm.value;
  const startDate = startMonth ? moment(startMonth).startOf('month').format('YYYY-MM-DD') : null;
  const endDate = endMonth ? moment(endMonth).endOf('month').format('YYYY-MM-DD') : null;
  let filterValue: string;
    if (this.selectedFilter === 'regierungsbezirk') {
      filterValue = this.selectedFilterValue; // from nb-select
    } else {
      const input = document.getElementById('filterValue') as HTMLInputElement | null;
      filterValue = input ? input.value : ''; // from input element
    }

  this.params = [];
  if (this.powerType && this.powerType != '#') {
    this.params.push('powerRange=' + this.powerType);
  }
  if (this.region) {
      
    this.params.push(`${this.region}=${filterValue}`);
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
