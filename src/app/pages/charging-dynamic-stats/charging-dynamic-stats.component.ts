import { formatDate } from '@angular/common';
import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NbThemeService } from '@nebular/theme';
import { Console } from 'console';
import { delay } from 'rxjs/operators';
import { SmartLabService } from '../../service/evp/smartlabs.service';
import * as htmlToImage from 'html-to-image';
import { start } from 'repl';

@Component({
  selector: 'ngx-charging-dynamic-stats',
  templateUrl: './charging-dynamic-stats.component.html',
  styleUrls: ['./charging-dynamic-stats.component.scss']
})
export class ChargingDynamicStatsComponent implements OnInit, AfterViewInit, OnDestroy {

  ngOnInit(): void {
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



  intotalOccupiedoption: any = {};
  intotalAvailableoption: any = {};
  byDayOccupiedoption: any = {};
  byDayAvailableoption: any = {};
  byNightOccupiedoption: any = {};
  byNightAvailableoption: any = {};
  othersOption: any = {};
  byDayOthersoption: any ={};
  byNightOthersoption: any = {};


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
    await this.getChargePointOccupiedTimeStats();
  }


  filterButtonClick() {
    const selectedDate = (document.getElementById('dateRangeFilter') as any).value.split(' - ');
    const input = document.getElementById('filterValue') as HTMLInputElement;
  
    if (!selectedDate[0]) {
      alert('Bitte ein Datum oder einen Zeitraum auswählen!');
    } else {
      this.getChargePointOccupiedTimeStats()
        .then(() => {
          if (this.filteredData.length === 0) {
            alert('Keine entsprechenden Daten in der Datenbank gefunden.');
          }
        })
        .catch(error => {
          console.error('Fehler beim Abrufen der Daten:', error);
          alert('Keine entsprechenden Daten in der Datenbank gefunden.');
        });
    }
  }
  

  allEvseIdsButtonClick() {
    const selectedDate = (document.getElementById('dateRangeFilter') as any).value.split(' - ');
  
    if (!selectedDate[0]) {
      alert('Bitte ein Datum oder einen Zeitraum auswählen');
    } else {
      this.getAllEvseIdsOccupiedTimeStats();
    }
  }

  areaButtonClick(){
    const selectedDate = (document.getElementById('dateRangeFilter') as any).value.split(' - ');
    if (!selectedDate[0]) {
      alert('Bitte ein Datum oder einen Zeitraum auswählen');
    } else {
      this.getChargePointOccupiedTimeArea();
    }
  }
  
  

  
  
  
  async getChargePointOccupiedTimeStats() {
    const input = document.getElementById('filterValue') as HTMLInputElement;
    this.selectedFilter = "singleEvse"
    
    const selectedDate = (document.getElementById('dateRangeFilter') as any).value.split(' - ');
   
   
    let startDate, endDate;
    let filteredData;
    let totalDays = 1;
    
    if (selectedDate.length === 1) { 
      startDate = new Date(selectedDate[0]);
      endDate = new Date(selectedDate[0]);
      endDate.setHours(23, 59, 59, 999);
      this.startDate= selectedDate[0];
    
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('Ungültiges Datum oder ungültiger Zeitraum. Bitte überprüfen!');
        return;
      }
    
     startDate.setDate(startDate.getDate() - 1)
      
      const data = await this.apiService.getChargePointOccupiedTime(input.value, startDate.toISOString());
      filteredData = data.filter(item => {
        const itemDate = new Date(item.createdAtFormatted);
        console.log(item.createdAtFormatted)
        return itemDate >= startDate && itemDate < endDate;
      });
      this.filteredData = filteredData;
      
      console.log(filteredData)
    } 
    
    else if (selectedDate.length === 2) {
      startDate = new Date(selectedDate[0]);
      endDate = new Date(selectedDate[1]);
      endDate.setHours(23, 59, 59, 999);
      this.startDate= selectedDate[0];
      this.endDate= selectedDate[1];
   
    
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('Ungültiges Datum oder ungültiger Zeitraum. Bitte überprüfen!');
        return;
      }
    
      startDate.setDate(startDate.getDate() - 1)
      const data = await this.apiService.getChargePointOccupiedTime(input.value, startDate.toISOString());
      filteredData = data.filter(item => {
        const itemDate = new Date(item.createdAtFormatted);
        console.log(item.createdAtFormatted)
        return itemDate >= startDate && itemDate <= endDate;
      });
      console.log(filteredData)
      totalDays = Math.ceil(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))-1;
      console.log(totalDays)
    } 
   
    else {
      console.error('Ungültiges Datum oder ungültiger Zeitraum. Bitte überprüfen!');
      return;
    }
    if (filteredData.length === 0) {
     // alert(`Keine Daten gefunden für ${formattedDate}`);
      return;
    }
    
    const latestData = filteredData[0];
  
    let totalOccupiedDayTime = 0;
    let totalOccupiedNightTime = 0;
    let totalAvailableDayTime = 0;
    let totalAvailableNightTime = 0;

    filteredData.forEach(data => {
      totalOccupiedDayTime += data.occupiedDayTime;
      totalOccupiedNightTime += data.occupiedNightTime;
      totalAvailableDayTime += data.availableDayTime;
      totalAvailableNightTime += data.availableNightTime;
    });

    const totalMinutes = 24 * 60*totalDays;
    const dayMinutes = 11 * 60*totalDays;
    const nightMinutes = 13 * 60*totalDays;

    const occupiedDayNight = totalOccupiedDayTime + totalOccupiedNightTime;
    const availableDayNight = totalAvailableDayTime + totalAvailableNightTime;

    this.intotalOccupied = parseFloat((occupiedDayNight / totalMinutes * 100).toFixed(2));
    this.intotalAvailable = parseFloat((availableDayNight / totalMinutes * 100).toFixed(2));
    this.byDayOccupied = parseFloat((totalOccupiedDayTime / dayMinutes * 100).toFixed(2));
    this.byDayAvailable = parseFloat((totalAvailableDayTime / dayMinutes * 100).toFixed(2));
    this.byNightOccupied = parseFloat((totalOccupiedNightTime / nightMinutes * 100).toFixed(2));
    this.byNightAvailable = parseFloat((totalAvailableNightTime / nightMinutes * 100).toFixed(2));
    this.others = parseFloat(((totalMinutes-occupiedDayNight-availableDayNight)/totalMinutes*100).toFixed(2));
    this.byDayOthers = parseFloat((100-this.byDayAvailable-this.byDayOccupied).toFixed(2));
    this.byNightOthers = parseFloat((100- this.byNightAvailable-this.byNightOccupied).toFixed(2));

    this.printDataSingleEvse.push([
      `${this.startDate}${this.endDate ? '-' + this.endDate : ''}`,
       this.inputId,
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
   
  }

  async getAllEvseIdsOccupiedTimeStats() {
    const selectedDate = (document.getElementById('dateRangeFilter') as any).value.split(' - ');
    this.selectedFilter = 'allEvse'
    let startDate, endDate;
    let totalDays = 1;

    if (selectedDate.length === 1) {
      startDate = new Date(selectedDate[0]);
      endDate = new Date(selectedDate[0]);
      endDate.setHours(23, 59, 59, 999);
      this.startDate = selectedDate[0];

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('Ungültiges Datum oder ungültiger Zeitraum. Bitte überprüfen!');
        return;
      }
    } else if (selectedDate.length === 2) {
      startDate = new Date(selectedDate[0]);
      endDate = new Date(selectedDate[1]);
      endDate.setHours(23, 59, 59, 999);
      this.startDate = selectedDate[0];
      this.endDate = selectedDate[1];

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('Ungültiges Datum oder ungültiger Zeitraum. Bitte überprüfen!');
        return;
      }

      totalDays = Math.ceil(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    } else {
      console.error('Ungültiges Datum oder ungültiger Zeitraum. Bitte überprüfen!');
      return;
    }

    const occupiedTimeData = await this.apiService.getChargePointOccupiedTimeTotalRange(startDate.toISOString(), endDate.toISOString());
    const chartData = await (await this.apiService.getCharttDataCombined(null)).toPromise(); 

    let filteredOccupiedTimeData = occupiedTimeData.filter(datum => new Date(datum.createdAt) >= startDate && new Date(datum.createdAt) <= endDate);
    let filteredChartData = chartData.filter(datum => new Date(datum.name) >= startDate && new Date(datum.name) <= endDate);

    if (filteredOccupiedTimeData.length === 0 || filteredChartData.length === 0) {
      alert(`Keine Daten gefunden für ${startDate.toISOString()} - ${endDate.toISOString()}`);
      return;
    }

    const totalChargePoints = filteredChartData.reduce((acc, datum) => acc + Number(datum.value), 0);

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
   

  }

  async getChargePointOccupiedTimeArea() {
   
    const input = document.getElementById('filterValue') as HTMLInputElement;
    const selectedDate = (document.getElementById('dateRangeFilter') as any).value.split(' - ');
 
    console.log("selected Date",selectedDate)
    
  
    let startDate, endDate;
    let totalDays = 1;
    let totalEvseIdCount = 0;
    let filteredData;
  
    
  if (selectedDate.length === 1) {
      startDate = new Date(selectedDate[0]);
      endDate = new Date(selectedDate[0]);
      endDate.setHours(23, 59, 59, 999);
      this.startDate = selectedDate[0];
     
  
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('Ungültiges Datum oder ungültiger Zeitraum. Bitte überprüfen!');
        return;
      }
  
      let data;
      startDate.setDate(startDate.getDate() + 1)
      if (this.selectedFilter === 'kreise') {
        data = await this.apiService.getChargePointOccupiedTimeKreis(this.selectedArea, startDate.toISOString(), endDate.toISOString());
        filteredData = data.filter(item => item.administrativeAreaLevel3 === this.selectedArea && item.formattedDate === startDate.toISOString().split('T')[0]);
      } else if (this.selectedFilter === 'regierungsbezirke') {
        data = await this.apiService.getChargePointOccupiedTimeBezirk(this.selectedArea, startDate.toISOString(), endDate.toISOString());
        filteredData = data.filter(item => item.administrativeArea === this.selectedArea && item.formattedDate === startDate.toISOString().split('T')[0]);
      }
     
 console.log(filteredData)
     totalEvseIdCount = filteredData.reduce((sum, item) => sum + item.evseIdCount, 0);
     console.log(totalEvseIdCount)
      
     
      
    } else if (selectedDate.length === 2) {
      startDate = new Date(selectedDate[0]);
      endDate = new Date(selectedDate[1]);
      endDate.setHours(23, 59, 59, 999);
      this.startDate = selectedDate[0];
      this.endDate =selectedDate[1];
  
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('Ungültiges Datum oder ungültiger Zeitraum. Bitte überprüfen!');
        return;
      }
  
      let data;
    
      if (this.selectedFilter === 'kreise') {

        data = await this.apiService.getChargePointOccupiedTimeKreis(this.selectedArea, startDate.toISOString(), endDate.toISOString());
        filteredData = data.filter(item => {
          const itemCreatedAt = new Date(item.createdAt);
          return item.administrativeAreaLevel3 === this.selectedArea &&
                 itemCreatedAt >= startDate && 
                 itemCreatedAt <= endDate;
        });
        console.log(filteredData)
      } else if (this.selectedFilter === 'regierungsbezirke') {

        data = await this.apiService.getChargePointOccupiedTimeBezirk(this.selectedArea, startDate.toISOString(), endDate.toISOString());

      filteredData = data.filter(item => {
        const itemCreatedAt = new Date(item.createdAt);
        return item.administrativeArea === this.selectedArea &&
               itemCreatedAt >= startDate && 
               itemCreatedAt <= endDate;
      });
      console.log(filteredData)
      
      }
      totalDays = Math.ceil(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      console.log(totalDays)
      totalEvseIdCount = filteredData.reduce((sum, item) => sum + item.evseIdCount, 0);
      console.log(totalEvseIdCount)
      
    } else {
      console.error('Invalid date range selected');
      return;
    }
  
    if (filteredData.length === 0) {
      return;
    }
  
    let totalOccupiedDayTime = 0;
    let totalOccupiedNightTime = 0;
    let totalAvailableDayTime = 0;
    let totalAvailableNightTime = 0;
  
    filteredData.forEach(data => {
      totalOccupiedDayTime += data.totalOccupiedDaytime;
      totalOccupiedNightTime += data.totalOccupiedNighttime;
      totalAvailableDayTime += data.totalAvailableDaytime;
      totalAvailableNightTime += data.totalAvailableNighttime;
    });

    console.log("totalOccupiedDayTime: ", totalOccupiedDayTime)
    console.log("totalOccupiedNightTime: ", totalOccupiedNightTime)

  
    const totalMinutes = 24 * 60  * totalEvseIdCount;
    console.log("totalMinutes: ", totalMinutes)
    const dayMinutes = 11 * 60  * totalEvseIdCount;
    console.log("dayMinutes: ",dayMinutes);
    const nightMinutes = 13 * 60  * totalEvseIdCount;
    console.log("nightMinutes: ",nightMinutes);

    const occupiedDayNight = totalOccupiedDayTime + totalOccupiedNightTime;
    console.log("occupiedDayNight: ", occupiedDayNight)
    const availableDayNight = totalAvailableDayTime + totalAvailableNightTime;
    console.log("availableDayNight: ", availableDayNight)

    this.intotalOccupied = parseFloat((occupiedDayNight / totalMinutes * 100).toFixed(2));
    this.intotalAvailable = parseFloat((availableDayNight / totalMinutes * 100).toFixed(2));
    this.byDayOccupied = parseFloat((totalOccupiedDayTime / dayMinutes * 100).toFixed(2));
    this.byDayAvailable = parseFloat((totalAvailableDayTime / dayMinutes * 100).toFixed(2));
    this.byNightOccupied = parseFloat((totalOccupiedNightTime / nightMinutes * 100).toFixed(2));
    this.byNightAvailable = parseFloat((totalAvailableNightTime / nightMinutes * 100).toFixed(2));
    this.others = parseFloat(((totalMinutes - occupiedDayNight - availableDayNight) / totalMinutes *100).toFixed(2));
    this.byDayOthers = parseFloat((100-this.byDayAvailable-this.byDayOccupied).toFixed(2));
    this.byNightOthers = parseFloat((100- this.byNightAvailable-this.byNightOccupied).toFixed(2));

    if(this.selectedFilter === 'regierungsbezirke'){
      this.printDataRegierungsbezirk.push([
        `${this.startDate}${this.endDate ? '-' + this.endDate : ''}`,
         this.selectedArea,
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

    }else if(this.selectedFilter === 'kreise'){
      this.printDataKreise.push([
        `${this.startDate}${this.endDate ? '-' + this.endDate : ''}`,
         this.selectedArea,
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
    }
   
    
    
  
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

  downloadImage(type:any){
    var node = document.getElementById('print');
    htmlToImage.toJpeg(node, { quality: 0.95 })
    .then(function (dataUrl) {
      var link = document.createElement('a');
      if(type=='jpeg'){
        link.download = 'Dynamic'+Date.now()+'.jpeg';
      }
      else {
        link.download = 'Dynamic'+Date.now()+'.png';
      }      
      link.href = dataUrl;
      link.click();
    });
  }
  
  
  private convertToCSV(data: any[], headerLabel: string): string {
    const header = ['Datum',headerLabel, 'Gesamt Belegungszeit', 'Gesamt Vefügbare Zeit','Sonstiges Zeit Gesamt(Außer Betrieb, Unbekannt, Reserviert)', 'Bei Tag Belegungszeit', 'Bei Tag Verfügbar Zeit', 'Sonstiges Zeit Tag(Außer Betrieb, Unbekannt, Reserviert)','Bei Nacht Belegungszeit', 'Bei Nacht Verfügbar Zeit', 'Sonstiges Zeit Nacht(Außer Betrieb, Unbekannt, Reserviert)'];
    const csvRows = [header.join(';')];
    
    data.forEach((row) => {
      const sanitizedRow = row.map((value, index) => {
        
        if ([2, 4, 7,8,9,10].includes(index) && typeof value === 'number') {
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

}
