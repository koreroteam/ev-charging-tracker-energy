import { Component, OnDestroy } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import * as moment from 'moment';
import { SmartLabService } from '../../../service/evp/smartlabs.service';
import { Electricity, ElectricityChart, ElectricityData } from '../../../@core/data/electricity';
import { takeWhile } from 'rxjs/operators';
import { concatMap, map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { UntypedFormControl } from '@angular/forms';

@Component({
  selector: 'ngx-electricity',
  styleUrls: ['./electricity.component.scss'],
  templateUrl: './electricity.component.html',
})
export class ElectricityComponent implements OnDestroy {

  private alive = true;

  listData: Electricity[];
  chartData: ElectricityChart[];

  type = 'week';
  types = ['week', 'month', 'year'];

  currentTheme: string;
  themeSubscription: any;

  

  constructor(private theme: NbThemeService, private apiService: SmartLabService,private electricityService: ElectricityData,
    private themeService: NbThemeService) {
    this.themeSubscription = this.theme.getJsTheme().subscribe(config => {
      this.themeService.getJsTheme()
      .pipe(takeWhile(() => this.alive))
      .subscribe(theme => {
        this.currentTheme = theme.name;
    });
      const colors: any = config.variables;
    });
    
  
  }
 

  async ngOnInit() {
    await this.fetchData();
    this.getLast7DaysData();
}


  results: any[];

  showLegend:boolean = true;
  showXAxis = true;
  showYAxis = true;
  xAxisLabel = 'Dates';
  yAxisLabel = 'NumberOfStations';
  legendTitle = 'Leistungsklasse'
  // colorScheme: any;

  params: String[] = [];
  powerType: any;
  region: any;
  selectedFilter: string;
  selectedFilterValue: string = '';
  allData: any[] = [];

  showInput: any = '#';
  colorScheme = {
    domain: ['#555A60', '#00877F', '#DCBD23']
  };

  filterForm = new UntypedFormControl('');
  startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
  endDate = moment().format('YYYY-MM-DD');


  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }

  async getLast7DaysData() {
   

    const endDate = moment();
    const startDate = moment().subtract(7, 'days');
    console.log(startDate)
    
    const filteredData = this.allData.filter(item => {
        const itemDate = moment(item.formattedDate, 'YYYY-MM-DD');
        return itemDate.isBetween(startDate, endDate, 'day', '[]');
    });

    this.processData(filteredData);
}

async fetchData() {
 
  this.allData = await (await this.apiService.getChargePointInfoSummary(this.params)).toPromise();
  console.log('Fetched data:', this.allData);
  
}


async getChargepointGraph() {
    const param = this.buildparams();
  
   
    this.allData = await (await this.apiService.getChargePointInfoSummary(param)).toPromise();

}

processData(data) {
    let acNumber = [];
    let dcNumber = [];
    let hpcNumber = [];
    let date = [];   

    data.forEach(element => {
        acNumber.push(element.acNumber);
        dcNumber.push(element.dc);
        hpcNumber.push(element.hpc);
        date.push(moment(element.formattedDate, 'YYYY-MM-DD').format('MMM D'));   
    });

    let chartData = [];
    for (let i = 0; i < date.length; i++) {
        chartData.push({
            name: date[i],
            series: [
                {
                    name: 'AC',
                    value: acNumber[i]
                },
                {
                    name: 'DC',
                    value: dcNumber[i]
                },
                {
                    name: 'HPC',
                    value: hpcNumber[i]
                },
            ],
           
        });
    }

    this.results = chartData;
    console.log(this.results)
}


changePowerFilter(data) {
  
  this.powerType = data;
  this.updateChart();
}

async updateChart() {
 
  if (!this.allData) {
      await this.fetchData();
  }
  this.buildparams();
}

 
buildparams() {
  let powerFilter;
  let dateRangeStart;
  let dateRangeEnd;

  if (this.powerType && this.powerType != '#') {
    console.log('Selected power type:', this.powerType);
    powerFilter = this.powerType;
  }

  const dateRange = document.getElementById('dateRangeFilter') as HTMLInputElement | null;
  if (dateRange && dateRange.value && dateRange.value.trim() !== '') {
    console.log('dateRange value:', dateRange.value);
    dateRangeStart = moment(dateRange.value.substring(0, 13), 'MMM D, YYYY');
    dateRangeEnd = moment(dateRange.value.substring(14, 30), 'MMM DD, YYYY');
} else {
    dateRangeEnd = moment();
    dateRangeStart = moment().subtract(7, 'days');
    console.log('Defaulting to last 7 days:', dateRangeStart.format('YYYY-MM-DD'), dateRangeEnd.format('YYYY-MM-DD'));
}


  let filteredData = this.allData;

  // Filter based on date range
  filteredData = filteredData.filter(item => {
      const itemDate = moment(item.formattedDate, 'YYYY-MM-DD');
      return itemDate.isBetween(dateRangeStart, dateRangeEnd, 'day', '[]');
  });

  // Filter based on power type
  if (powerFilter) {
    filteredData = filteredData.map(item => {
        let newItem = {...item};
        switch (powerFilter) {
            case 'NC':
                newItem.dc = 0; 
                newItem.hpc = 0;
                break;
            case 'FC':
                newItem.acNumber = 0;
                newItem.hpc = 0;
                break;
            case 'HPC':
                newItem.acNumber = 0;
                newItem.dc = 0;
                break;
        }
        return newItem;
    });
  }
  
  this.processData(filteredData);
}



  
}