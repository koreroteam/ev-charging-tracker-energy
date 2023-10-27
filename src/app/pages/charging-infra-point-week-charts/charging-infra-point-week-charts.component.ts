import { Component, OnInit,  NgModule } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { SmartLabService } from '../../service/evp/smartlabs.service';
import * as htmlToImage from 'html-to-image';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import * as moment from 'moment';
import { forkJoin, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';



@Component({
  selector: 'ngx-charging-infra-point-week-charts',
  templateUrl: './charging-infra-point-week-charts.component.html',
  styleUrls: ['./charging-infra-point-week-charts.component.scss']
})
export class ChargingInfraPointWeekChartsComponent implements OnInit {

  constructor(private theme: NbThemeService, private apiService: SmartLabService) {
    this.themeSubscription = this.theme.getJsTheme().subscribe(config => {
      const colors: any = config.variables;
      // this.colorScheme = {
      //   domain: [colors.primaryLight, colors.infoLight, colors.successLight, colors.warningLight, colors.dangerLight],
      // };
    });

    
  }


  async ngOnInit() {
   
   //const endWeek = moment().endOf('week');
   const tenWeeksAgo = moment().subtract(10, 'weeks').startOf('week');
   const lastWeek = moment().endOf('week');
   this.weekRangeForm.patchValue({
     startWeek: tenWeeksAgo.format('YYYY-MM-DD'),
     endWeek: lastWeek.format('YYYY-MM-DD')
   });

    
    this.getChargepointGraph()
    this.updateChartData()
  }

  results: any[];

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
    domain: ['#46aa28', '#0068af', '#c20000']
  };

  filterForm = new UntypedFormControl('');
  selectedFilter: string;
  selectedFilterValue: string = '';

  weekRangeForm = new UntypedFormGroup({
    startWeek: new UntypedFormControl(''),
    endWeek: new UntypedFormControl(''),
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
      let normalCharging = {};
      let schnellCharging = {};
      let hpcCharging = {};
      let chartData = [];
      const currentYear = moment().year();
      const startDate = moment().year(currentYear).startOf('year');
      const endDate = moment().year(currentYear).endOf('year');
      const totalWeeks = moment().year(currentYear).isoWeeksInYear();
      console.log(totalWeeks)
    
      data = data.filter(weekData => {
        const date = moment(weekData.name, 'YYYY-MM-DD');
        return date.year() >= currentYear;
      });
    
      for (const weekData of data) {
        const date = moment(weekData.name, 'YYYY-MM-DD');
        const weekNum = date.isoWeek();
        if (date.isSame(startDate, 'day')) {
          continue;
        }
    
        normalCharging[weekNum] = weekData.normalCharging;
        schnellCharging[weekNum] = weekData.schnellCharging;
        hpcCharging[weekNum] = weekData.hpcCharging;
    
        
        const existingDataPoint = chartData.find(dataPoint => dataPoint.name === `KW${weekNum}`);
    
        if (existingDataPoint) {
          
          existingDataPoint.series = [
            {
              name: 'AC',
              value: normalCharging[weekNum]
            },
            {
              name: 'DC',
              value: schnellCharging[weekNum]
            },
            {
              name: 'HPC',
              value: hpcCharging[weekNum]
            }
          ];
        } else {
         
          chartData.push({
            name: `KW${weekNum}`,
            series: [
              {
                name: 'AC',
                value: normalCharging[weekNum]
              },
              {
                name: 'DC',
                value: schnellCharging[weekNum]
              },
              {
                name: 'HPC',
                value: hpcCharging[weekNum]
              }
            ]
          });
        }
      }
    
      const xAxisLabel = `Weeks (${startDate.format('MMM D, YYYY')} - ${endDate.format('MMM D, YYYY')})`;
    
      this.results = chartData;
      this.xAxisLabel = xAxisLabel;
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
        this.params.push(this.region + '=' + filterValue);
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
        } else if (this.region === 'landkreis') {
          this.params.push(`landkreis=${input.value}`);
        } else if (this.region === 'regierungsbezirk') {
          this.params.push(`regierungsbezirk=${this.selectedFilterValue}`);
        } 
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
