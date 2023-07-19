import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NbThemeService } from '@nebular/theme';
import * as moment from 'moment';
import * as htmlToImage from 'html-to-image';
import { SmartLabService } from '../../service/evp/smartlabs.service';

@Component({
  selector: 'ngx-charging-infra-point-power-week-charts',
  templateUrl: './charging-infra-point-power-week-charts.component.html',
  styleUrls: ['./charging-infra-point-power-week-charts.component.scss'],
})

export class ChargingInfraPointPowerWeekChartsComponent implements OnInit{
  
  constructor(private theme: NbThemeService, private apiService: SmartLabService,private fb: FormBuilder) {
    this.weekRangeForm = this.fb.group({
      startWeek: [null],
      endWeek: [null],
    });
    this.themeSubscription = this.theme.getJsTheme().subscribe((config) => {
      const colors: any = config.variables;
      
    });
  }

  async ngOnInit() {
    
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
    domain: ['#46aa28', '#0068af', '#c20000'],
  };
  themeSubscription: any;
  filterForm = new FormControl('');
  params: String[] = [];
  powerType: any;
  region: any;
  startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
  endDate = moment().format('YYYY-MM-DD');
  showInput: string = '#';

  weekRangeForm = new FormGroup({
    startWeek: new FormControl(''),
    endWeek: new FormControl(''),
  });

  filterValue: any;
 

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }


  onSubmit(){

    this.updateChartData();
  }
 

  async getChargepointGraph(param?: string) {
    if (!param) {
    param = this.buildparams();
    }
    (await this.apiService.getCharttDataCombined(param)).subscribe(data => {
    this.processData(data);
    console.log(data)
    });
    }

  

  processData(data) {
    let acTotalPower = {};
    let dcTotalPower = {};
    let hpcTotalPower = {};
    let chartData = [];
    const currentYear = moment().year();
    const startDate = moment().year(currentYear).startOf('year');
    const endDate = moment().year(currentYear).endOf('year');
    const totalWeeks = moment().year(currentYear).isoWeeksInYear();
    console.log(totalWeeks)
  
    console.log("Data before filtering:", data);

    data = data.filter(weekData => {
      const date = moment(weekData.name, 'YYYY-MM-DD');
      return date.year() >= currentYear;
    });
    
    console.log("Data after filtering:", data);
    
    for (const weekData of data) {
      const date = moment(weekData.name, 'YYYY-MM-DD');
      const weekNum = date.isoWeek();
      if (date.isSame(startDate, 'day')) {
        continue;
      }
  
      acTotalPower[weekNum] = Math.round(weekData.acTotalPower/100)/10;
      dcTotalPower[weekNum] = Math.round(weekData.dcTotalPower/100)/10
      hpcTotalPower[weekNum] = Math.round(weekData.hpcTotalPower/100)/10
  
      
      const existingDataPoint = chartData.find(dataPoint => dataPoint.name === `KW${weekNum}`);
  
      if (existingDataPoint) {
        
        existingDataPoint.series = [
          {
            name: 'AC',
            value:  acTotalPower[weekNum]
          },
          {
            name: 'DC',
            value:  dcTotalPower[weekNum]
          },
          {
            name: 'HPC',
            value: hpcTotalPower[weekNum]
          }
        ];
      } else {
       
        chartData.push({
          name: `KW${weekNum}`,
          series: [
            {
              name: 'AC',
              value:  acTotalPower[weekNum]
            },
            {
              name: 'DC',
              value:  dcTotalPower[weekNum]
            },
            {
              name: 'HPC',
              value: hpcTotalPower[weekNum]
            }
          ]
        });
      }
    }
  
    const xAxisLabel = `Weeks (${startDate.format('MMM D, YYYY')} - ${endDate.format('MMM D, YYYY')})`;
  
    this.results = chartData;
this.xAxisLabel = xAxisLabel;

console.log("Updated chart data:", this.results, "xAxisLabel:", this.xAxisLabel);

  }
  

  buildparams() {
    this.params = [];
    const input = document.getElementById('filterValue') as HTMLInputElement | null;
    if (this.powerType && this.powerType!='#' ) {
      this.params.push('powerRange=' + this.powerType);
    }
    if (this.region) {
      if (this.region === 'city') {
        this.params.push(`cityName=${input.value}`);
      } else if (this.region === 'zipcode') {
        this.params.push(`zipcode=${input.value}`);
      } else if (this.region === 'regierungsbezirk') {
        this.params.push(`regierungsbezirk=${this.selectedFilterValue}`);
      }else if (this.region === 'landkreis') {
        this.params.push(`landkreis=${input.value}`);
      }
    }
  
    return this.params.join("&");
  }
  

  
  async updateChartData() {
    const { startWeek, endWeek } = this.weekRangeForm.value;
    const startDate = startWeek ? moment(startWeek).isoWeekday(1) : null;
    const endDate = endWeek ? moment(endWeek).isoWeekday(7) : null;
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
      this.params.push(`startDate=${startDate.format('YYYY-MM-DD')}&endDate=${endDate.format('YYYY-MM-DD')}`);
    }
  
    const param = this.params.join("&");
    const rawData = await (await this.apiService.getCharttDataCombined(param)).toPromise();
    
    const filteredData = rawData.filter(weekData => {
      const date = moment(weekData.name, 'YYYY-MM-DD');
      return (!startDate || date.isSameOrAfter(startDate)) && (!endDate || date.isSameOrBefore(endDate));
    });
  
    this.processData(filteredData);
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
