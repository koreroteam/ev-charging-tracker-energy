import { Component, OnInit,  NgModule } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { SmartLabService } from '../../service/evp/smartlabs.service';
import * as htmlToImage from 'html-to-image';
import { UntypedFormControl } from '@angular/forms';
import * as moment from 'moment';



@Component({
  selector: 'ngx-charging-infra-occupied-time',
  templateUrl: './charging-infra-occupied-time.component.html',
  styleUrls: ['./charging-infra-occupied-time.component.scss']
})
export class ChargingInfraOccupiedTimeComponent implements OnInit {

  constructor(private theme: NbThemeService, private apiService: SmartLabService) {
    this.themeSubscription = this.theme.getJsTheme().subscribe(config => {
      const colors: any = config.variables;
      // this.colorScheme = {
      //   domain: [colors.primaryLight, colors.infoLight, colors.successLight, colors.warningLight, colors.dangerLight],
      // };
    });

    
  }


  async ngOnInit() {
    
   
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
    domain: ['rgba(0,111,122)', 'rgba(0,135,127)', 'rgba(220,189,35)','rgba(85,90,96)', 'rgba(203,208,207)']
  };

  filterForm = new UntypedFormControl('');
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
    } else {
        seriesData = this.processDataForSelectedEvseIds(data, evseIds, datesInRange);
    }
      console.log('seriesData:', seriesData);
  
      this.chartData = seriesData;
  
      console.log('chartData:', this.chartData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  processDataForArea(data:any[],datesInRange:string[],selectedArea: string){
    let seriesData = [];
   

    console.log(datesInRange)   
    
    datesInRange.forEach(date => {
      console.log(date)
      let totalOccupiedTime = 0;
      data.forEach(item => {

       
      if(this.selectedFilter === 'regierungsbezirke'){
        if (item.formattedDate === date && item.administrativeArea === this.selectedArea) {
          console.log('totalOccupiedDaytime:', item.totalOccupiedDaytime, 'totalOccupiedNightTime:', item.totalOccupiedNighttime);
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
  
    console.log(this.selectedArea)
   
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
    console.log('data:', data);
    console.log('datesInRange:', datesInRange);
    this.selectedFilter = "allEvse"
    let seriesData = [];

    
    
    datesInRange.forEach(date => {
      let totalOccupiedTime = 0;
      data.forEach(item => {
        console.log('item:', item);
      
        if (item.formattedDate === date) {
          totalOccupiedTime += item.occupiedDayTime + item.occupiedNightTime;
          this.printAllEvse.push([
            date,
            "Alle EvseID",
            totalOccupiedTime
          ]);
        }
        console.log('date:', date, 'createdAtFormatted:', item.formattedDate);
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
  
  
  
  
  
  
  processDataForSelectedEvseIds(data: any[], evseIds: string[], datesInRange: string[]) {
    const seriesData = [];
    let evseIdsWithAllNulls = [];
    this.selectedFilter = "singleEvse"
  
    evseIds.forEach((evseId, index) => {
      let allNullsForEvseId = true;
      
      const series = datesInRange.map(date => {
        const evseData = data[index];
        const item = evseData.find(item => item.createdAtFormatted === date && item.evseID === evseId);
  
        if (!item) {
          console.error(`No data for date ${date} and evse_id ${evseId}`);
          return {
            name: date,
            value: 0
          };
        }
  
        const totalOccupiedTime = item.occupiedDayTime + item.occupiedNightTime;
        this.printDataSingleEvse.push([
          date,
          evseId,
          totalOccupiedTime
        ]);
        if (totalOccupiedTime > 0) {
          allNullsForEvseId = false;
        }
  
        return {
          name: date,
          value: totalOccupiedTime || 0 
        };
      });
  
      if (allNullsForEvseId) {
        evseIdsWithAllNulls.push(evseId);
      }
  
      seriesData.push({
        name: evseId,
        series: series
      });
    });
  
    if (evseIdsWithAllNulls.length > 0) {
      setTimeout(() => {
        alert(`Notification: No data available for the following EVSE IDs: ${evseIdsWithAllNulls.join(', ')}`);
      }, 500); 
    }
  
    console.log('seriesData:', seriesData);
  
    return seriesData;
  }

  private convertToCSV(data: any[], headerLabel: string): string {
    const header = ['Datum',headerLabel, 'Gesamt Belegungszeit'];
    const csvRows = [header.join(';')];
    
    data.forEach((row) => {
      const sanitizedRow = row.map((value, index) => {
        
        if ([2].includes(index) && typeof value === 'number') {
          return `="${value}"`;
        }
        return `"${value}"`; 
      });
      csvRows.push(sanitizedRow.join(';'));
    });
  
    return csvRows.join('\n');
  }
  
  
  public downloadCSV(filename: string, data: any[], headerLabel: string): void {
    const csvData = this.convertToCSV(data, headerLabel);
    const blob = new Blob([`\uFEFF${csvData}`], { type: 'text/csv;charset=utf-8;' }); 
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
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
