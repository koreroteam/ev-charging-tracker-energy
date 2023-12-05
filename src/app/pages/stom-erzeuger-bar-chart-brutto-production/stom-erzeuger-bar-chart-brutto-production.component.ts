import { Component, OnInit,  NgModule } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { SmartLabService } from '../../service/evp/smartlabs.service';
import * as htmlToImage from 'html-to-image';
import { FormControl, FormGroup, UntypedFormControl } from '@angular/forms';
import * as moment from 'moment';
import { HttpParams } from '@angular/common/http';


@Component({
  selector: 'ngx-stom-erzeuger-bar-chart-brutto-production',
  templateUrl: './stom-erzeuger-bar-chart-brutto-production.component.html',
  styleUrls: ['./stom-erzeuger-bar-chart-brutto-production.component.scss']
})
export class StromErzeugerBarChartBruttoProductionComponent implements OnInit {

  constructor(private theme: NbThemeService, private apiService: SmartLabService) {
    this.themeSubscription = this.theme.getJsTheme().subscribe(config => {
      const colors: any = config.variables;
    });

    
  }


  async ngOnInit() {
    
    this.getLast7DaysData();
     this.dateRangeForm = new FormGroup({
      dateRange: new FormControl()
    });
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
  selectedFilter: string;
  selectedFilterValue: string = '';
  dateRangeForm: FormGroup;


  selectedType: string = ''; // For type selection
  zipcodeFilter: string = ''; // For zipcode input
  startDate: string = '';
  endDate: string = '';
 

  showInput: any = '#';
  colorScheme = {
    domain: ['#006F7A', '#00877F', '#DCBD23']
  };

  filterForm = new UntypedFormControl('');
  


  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }

  async getLast7DaysData() {
    this.endDate = moment().format('YYYY-MM-DD');
    this.startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
    const param = `startDate=${this.startDate}&endDate=${this.endDate}`;
    
    const data = await (await this.apiService.getStromInfraSummaryInfo()).toPromise();
    this.processData(data,'summary');
}
  
  
getChargepointGraph() {
  this.apiService.getStromInfraSummaryInfo(this.startDate, this.endDate).subscribe(data => {
    this.processData(data,'summary');
  });
}


applyFilters() {
  this.retrieveDateRange();
  console.log(`Applying filters with Type: ${this.selectedType}, Zipcode: ${this.zipcodeFilter}, Start Date: ${this.startDate}, End Date: ${this.endDate}`);

  if (this.zipcodeFilter) {
    // If a type is selected, call only that specific type of API
    if (this.selectedType && this.selectedType !== '#') {
      console.log(`Calling ${this.selectedType} API with Zipcode: ${this.zipcodeFilter}`);
      this.callTypeSpecificApi(this.selectedType, this.zipcodeFilter, this.startDate, this.endDate);
    } else {
      // If no type is selected, aggregate all types
      console.log('Aggregating all types for Zipcode:', this.zipcodeFilter);
      this.callApisForZipcode(this.zipcodeFilter, this.startDate, this.endDate);
    }
  } else if (this.selectedType && this.selectedType !== '#') {
    // If a type is selected but no zipcode, call the summary API
    console.log('Calling summary API with date range');
    this.getChargepointGraph();
  } else {
    // If neither type nor zipcode is selected, call the summary API
    console.log('Calling summary API');
    this.getChargepointGraph();
  }
}





retrieveDateRange() {
  const dateRange = document.getElementById('dateRangeFilter') as HTMLInputElement;
  if (dateRange && dateRange.value) {
    this.startDate = moment(dateRange.value.substring(0, 13), 'MMM D, YYYY').format('YYYY-MM-DD');
    this.endDate = moment(dateRange.value.substring(14, 30), 'MMM DD, YYYY').format('YYYY-MM-DD');
  }
}


 async callTypeSpecificApi(type: string, zipcode: string, startDate?: string, endDate?: string) {
    console.log(`Calling API for Type: ${type}, Zipcode: ${zipcode}, Start Date: ${startDate}, End Date: ${endDate}`);
    if (type === 'summary') {
      (await this.apiService.getStromInfraSummaryInfo(startDate, endDate)).subscribe(data => {
        this.processData(data, 'summary');
      });
    }
  switch (type) {
    case 'solar':
      (await this.apiService.getStromInfraSolarInfo(zipcode, startDate, endDate)).subscribe(data => {
        this.processData(data, 'solar');
      });
      break;
    case 'stromSpeicher':
      (await this.apiService.getStromInfraStromSpeicherInfo(zipcode, startDate, endDate)).subscribe(data => {
        this.processData(data, 'stromSpeicher');
      });
      break;
    case 'wind':
      (await this.apiService.getStromInfraWindInfo(zipcode, startDate, endDate)).subscribe(data => {
        this.processData(data, 'wind');
      });
      break;
      default:
        // Handle default or combined case
        this.callApisForZipcode(zipcode, startDate, endDate);
        break;
  }
}


flatten(arr: any[]): any[] {
  return arr.reduce((flat, toFlatten) => {
    return flat.concat(Array.isArray(toFlatten) ? this.flatten(toFlatten) : toFlatten);
  }, []);
}

async callApisForZipcode(zipcode: string, startDate?: string, endDate?: string) {
  const types = ['Solar', 'StromSpeicher', 'Wind'];
  const promises = types.map(type => {
    const methodName = `getStromInfra${type}Info`;
    return this.apiService[methodName](zipcode, startDate, endDate).toPromise()
      .then(data => data.map(item => ({ ...item, stromErzeugerType: type.toLowerCase() })));
  });

  try {
    const results = await Promise.all(promises);
    this.processCombinedData(this.flatten(results));
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}



processCombinedData(dataArray) {
  let aggregatedData = {};
  console.log(dataArray);
  dataArray.forEach(item => {
    if (item && item.createdAtFormatted && item.stromErzeugerType) {
      const dateKey = moment(item.createdAtFormatted, 'YYYY-MM-DD').format('MMM D');
      const typeKey = item.stromErzeugerType.toLowerCase();

      if (!aggregatedData[dateKey]) {
        aggregatedData[dateKey] = { solar: 0, stromspeicher: 0, wind: 0 };
      }

      // Only add to the aggregated data if the item's type matches the selected type
      if (this.selectedType && this.selectedType !== '#' && typeKey !== this.selectedType.toLowerCase()) {
        return; // Skip this item as it does not match the selected type
      }

      if (aggregatedData[dateKey].hasOwnProperty(typeKey)) {
        aggregatedData[dateKey][typeKey] += (item.bruttoLeistung / 1000) / 1000;// Convert kW to MW
      } else {
        console.warn(`Unrecognized type: ${typeKey}, item.stromErzeugerType: ${item.stromErzeugerType}`);
      }
    } else {
      console.warn('Missing required properties in item:', item);
    }
  });


  const chartData = Object.keys(aggregatedData).map(date => {
    return {
      name: date,
      series: [
        { name: 'Solar', value: aggregatedData[date].solar },
        { name: 'Strom Speicher', value: aggregatedData[date].stromspeicher },
        { name: 'Wind', value: aggregatedData[date].wind },
      ]
    };
  });

  this.results = chartData;
}


processData(data, apiType: string) {
  console.log(`Processing data for API Type: ${apiType}`, data);
  let chartData = [];
  let filteredData = data;

  if (this.selectedType && this.selectedType !== '#') {
    filteredData = data.filter(element => element.stromErzeugerType.toLowerCase() === this.selectedType.toLowerCase());
  }

  if (apiType === 'combined') {
    this.processCombinedData(filteredData);

   } else if (apiType === 'summary') {
    // Initialize data arrays
    let solarData = [];
    let windData = [];
    let stromSpeicherData = [];
    let dates = [];

    // Filter data based on selected type
    const filteredData = this.selectedType && this.selectedType !== '#' ? 
                         data.filter(element => element.stromErzeugerType === this.selectedType) : 
                         data;

    filteredData.forEach(element => {
      const formattedDate = moment(element.createdAtFormatted, 'YYYY-MM-DD').format('MMM D');
      if (!dates.includes(formattedDate)) {
        dates.push(formattedDate);
      }

      // Process data based on type
      switch (element.stromErzeugerType) {
        case 'Solar':
          solarData.push({ date: formattedDate, value: (element.totalBruttoProduction / 1000) / 1000 }); // Convert kW to GW
        break;
          break;
        case 'Wind':
          windData.push({ date: formattedDate, value: (element.totalBruttoProduction / 1000) / 1000  });
          break;
        case 'Strom Speicher':
          stromSpeicherData.push({ date: formattedDate, value: (element.totalBruttoProduction / 1000) / 1000 });
          break;
      }
    });

    // Sort dates
    dates.sort((a, b) => moment(a, 'MMM D').valueOf() - moment(b, 'MMM D').valueOf());

    // Build chart data
    chartData = dates.map(date => {
      return {
        name: date,
        series: [
          {
            name: 'Solar',
            value: solarData.find(item => item.date === date)?.value || 0
          },
          {
            name: 'Wind',
            value: windData.find(item => item.date === date)?.value || 0
          },
          {
            name: 'Strom Speicher',
            value: stromSpeicherData.find(item => item.date === date)?.value || 0
          }
        ]
      };
    });
  } else {
    // Initialize variables
    let aggregatedData = {};
    let dates = [];
  
    // Aggregate data by date
    filteredData.forEach(element => { // Use filteredData here
      const formattedDate = moment(element.createdAtFormatted, 'YYYY-MM-DD').format('MMM D');
      if (!dates.includes(formattedDate)) {
        dates.push(formattedDate);
        aggregatedData[formattedDate] = { solar: 0, wind: 0, stromSpeicher: 0 };
      }
      aggregatedData[formattedDate][apiType] += element.bruttoLeistung;
    });
  
    // Sort dates
    dates.sort((a, b) => moment(a, 'MMM D').valueOf() - moment(b, 'MMM D').valueOf());
  
    // Build chart data
    chartData = dates.map(date => {
      return {
        name: date,
        series: [
          {
            name: 'Solar',
            value: aggregatedData[date]['solar']
          },
          {
            name: 'Wind',
            value: aggregatedData[date]['wind']
          },
          {
            name: 'Strom Speicher',
            value: aggregatedData[date]['stromSpeicher']
          }
        ]
      };
    });
  }

  console.log('Processed Chart Data:', chartData);
  this.results = chartData;
}


changePowerFilter(powerType: string) {
  console.log(`Selected Power Type: ${powerType}`);
  this.selectedType = powerType;
  this.applyFilters();
}


  onDateChange() {
    const dateRange = this.dateRangeForm.get('dateRange').value;
    if (dateRange) {
      this.startDate = moment(dateRange.start).format('YYYY-MM-DD');
      this.endDate = moment(dateRange.end).format('YYYY-MM-DD');
  
      // Adjust if start and end dates are the same
      if (this.startDate === this.endDate) {
        this.endDate = moment(this.startDate).add(1, 'days').format('YYYY-MM-DD');
      }
  
      this.getChargepointGraph();
    }
  }
  
  
 changeRegion(data) {
  this.region = data;
  const input = document.getElementById('filterValue') as HTMLInputElement;
  if (input) {
    input.value = null;
  }
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