import { Component, OnInit, ViewChild, ElementRef, Renderer2, AfterViewInit, HostListener } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import * as L from 'leaflet';
import { SmartLabService } from '../../service/evp/smartlabs.service';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as turf from '@turf/turf';
import { Router } from '@angular/router';
import * as htmlToImage from 'html-to-image';
import { NbDatepicker } from '@nebular/theme';
import { max } from 'moment';

interface OccupiedTime {
  totalOccupiedDaytime: number;
  totalOccupiedNighttime: number;
}

@Component({
  selector: 'ngx-charging-infra-heat-map-occupied-time',
  templateUrl: './charging-infra-heat-map-occupied-time.component.html',
  styleUrls: ['./charging-infra-heat-map-occupied-time.component.scss']
})

export class ChargingInfraHeatMapOccupiedTimeComponent implements OnInit, AfterViewInit {
  
  @ViewChild('draggableLegend', { static: false }) draggableLegend: ElementRef;

  private active = false;
  private currentX = 0;
  private currentY = 0;
  private initialX = 0;
  private initialY = 0;
  private xOffset = 0;
  private yOffset = 0;
  private map;

  availableStations: any;
  markers: Number[][] = [];
  currentTheme: any;
  latLngGeom: any;
  http: HttpClient;
  inputZipcode: string = '';
  zipcodeFeatures: { [key: string]: L.Layer } = {};
  previousHighlightedFeature: any;
  geoJsonLayer: L.GeoJSON;
  zipCodeFilterOption: string = 'all';
  private regierungsbezirkFeatures: any;
  private kreiseFeatures: any;
  private previousHighlightedLayer: L.Layer;
  public inputRegierungsbezirk: string;
  public popupDataKreise: any[] = [];
  public popupDataRegierungsbezirk: any[] = [];
  selectedFilter: string; 
  selectedArea: string;
  colorThreshold: any;
  private addedHeaderLabels = new Set<string>();

  
  private async initMap(): Promise<void> {
    this.selectedFilter = 'regierungsbezirke';
    this.createMap();
    this.renderRegierungsbezirkMap()
  
  }
  
  private createMap(): void {
    if (this.map) {
      this.map.remove();
    }
    document.getElementById('heatMapOccupiedTime').style.backgroundColor = "rgba(85,90,96,0.3)";
  
  
    this.map = L.map('heatMapOccupiedTime', {
      center: [51.5200, 9.4050],
      zoom: 6,
    });
  
    // const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   maxZoom: 18,
    //   minZoom: 3,
    //   boundary: this.latLngGeom,
    // });
  
    // tiles.addTo(this.map);
  }
  
  
  async renderRegierungsbezirkMap(): Promise<void> {
    const regierungsbezirkFeatures = {};
    const kreiseFeatures = {};
   

    // Get the selected date range
    const selectedDate = (document.getElementById('dateRangeFilter') as any).value.split(' - ');
    const bezirkData = await this.apiService.getChargePointOccupiedTimeBezirk();
    const kreisData = await this.apiService.getChargePointOccupiedTimeKreis();
    const kreiseDataUrl = '/assets/vg250_krs.geojson';
    
    console.log(selectedDate)
  
    const { startDate, endDate, filteredData } = await this.filterDataByDate(selectedDate, bezirkData, kreisData);
  
    if (!startDate || !endDate || !filteredData) {
      console.error('Could not filter data by date');
      return;
    }
    
  if(this.selectedFilter === "regierungsbezirke"){

    const aggregatedData: Record<string, OccupiedTime> = filteredData.reduce((acc, curr) => {
      const key = curr.administrativeArea; // or administrativeAreaLevel3 for kreise
      if (!acc[key]) {
        acc[key] = {
          totalOccupiedDaytime: 0,
          totalOccupiedNighttime: 0
        };
      }
      acc[key].totalOccupiedDaytime += curr.totalOccupiedDaytime;
      acc[key].totalOccupiedNighttime += curr.totalOccupiedNighttime;
      return acc;
    }, {});
    const occupiedTimes = Object.values(aggregatedData).map((a: OccupiedTime) => a.totalOccupiedDaytime + a.totalOccupiedNighttime).filter(time => time !== 0);
    const sortedOccupiedTimes = occupiedTimes.sort((a, b) => a - b);
    console.log(sortedOccupiedTimes)
    const thresholds = [0,0.2, 0.4, 0.6, 0.8].map(percent => {
      const index = Math.round(percent * (sortedOccupiedTimes.length - 1));
      return sortedOccupiedTimes[index];
    });
    console.log(thresholds)

    this.getRegierungsbezirkData().subscribe((geoData) => {
      if (this.geoJsonLayer) {
        this.map.removeLayer(this.geoJsonLayer);
      }
    
      const mergedGeoJSON = this.mergeRegierungsbezirke(geoData);
      this.geoJsonLayer = L.geoJSON(mergedGeoJSON, {
        style: (feature) => {
          const bezirk = feature.properties.NAME_2;
        // console.log("Bezirk in geoJson, ",bezirk)
  
          // Find the corresponding area in the API response
          const areas = filteredData.filter(a => a.administrativeArea === bezirk);
        //  console.log(areas)
        
          // Determine the total occupied time for the bezirk
          const occupiedTime = areas.reduce((sum, area) => sum + area.totalOccupiedDaytime + area.totalOccupiedNighttime, 0);
          //console.log("occupiedTime: ", occupiedTime)
          
         
          const fillColor = this.getFillColor(occupiedTime,thresholds);

         // console.log(fillColor)
  
          return {
            color: fillColor,
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
          };
        },
  
        onEachFeature: (feature, layer) => {
          const name = feature.properties.NAME_2;
          const areas = filteredData.filter(a => a.administrativeArea === name);
          const occupiedTime = areas.reduce((sum, area) => sum + area.totalOccupiedDaytime + area.totalOccupiedNighttime, 0);


        //s  console.log("featureOccupied: ", occupiedTime)
          this.popupDataRegierungsbezirk.push([name, occupiedTime]);
  
          const popupContent = `Regierungsbezirk: ${name}<br>Geladene Minuten: ${occupiedTime}`;
  
          layer.on('mouseover', () => {
            layer.bindPopup(popupContent).openPopup();
          });
  
          layer.on('mouseout', () => {
            layer.closePopup();
          });
  
          layer.bindPopup(popupContent);
          regierungsbezirkFeatures[name] = layer;
          
        },
      }).addTo(this.map);
  
      this.kreiseFeatures = kreiseFeatures;
    });

  }else if(this.selectedFilter === 'kreise'){
   
    const aggregatedData: Record<string, OccupiedTime> = filteredData.reduce((acc, curr) => {
      const key = curr.administrativeAreaLevel3; // or administrativeAreaLevel3 for kreise
      if (!acc[key]) {
        acc[key] = {
          totalOccupiedDaytime: 0,
          totalOccupiedNighttime: 0
        };
      }
      acc[key].totalOccupiedDaytime += curr.totalOccupiedDaytime;
      acc[key].totalOccupiedNighttime += curr.totalOccupiedNighttime;
      return acc;
    }, {});
    
   
    // Determine the maximum occupied time for all areas
    const occupiedTimes = Object.values(aggregatedData).map((a: OccupiedTime) => a.totalOccupiedDaytime + a.totalOccupiedNighttime);
    const sortedOccupiedTimes = occupiedTimes.sort((a, b) => a - b);
    console.log(sortedOccupiedTimes)
    const thresholds = [0, 0.2, 0.4, 0.6, 0.8].map(percent => {
      const index = Math.round(percent * (sortedOccupiedTimes.length - 1));
      return sortedOccupiedTimes[index];
    });
    console.log(thresholds)

    this.http.get(kreiseDataUrl).subscribe((data: any) => {
      if (this.geoJsonLayer) {
        this.map.removeLayer(this.geoJsonLayer);
      }
      this.geoJsonLayer = L.geoJSON(data, {
        style: (feature) => {
          const kreiseName = feature.properties.GEN;
          const areas = filteredData.filter(a => a.administrativeAreaLevel3 === kreiseName);
          const occupiedTime = areas.reduce((sum, area) => sum + area.totalOccupiedDaytime + area.totalOccupiedNighttime, 0);
         
          const fillColor = this.getFillColor(occupiedTime, thresholds);

          return {
            color: fillColor,
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
          };
        },
        onEachFeature: (feature, layer) => {
          const name = feature.properties.GEN;
          const areas = filteredData.filter(a => a.administrativeAreaLevel3 === name);
          const occupiedTime = areas.reduce((sum, area) => sum + area.totalOccupiedDaytime + area.totalOccupiedNighttime, 0);


        //  console.log("featureOccupied: ", occupiedTime)
          this.popupDataKreise.push([name, occupiedTime]);
  
          const popupContent = `Landkreis: ${name}<br>Geladene Minuten: ${occupiedTime}`;
  
          layer.on('mouseover', () => {
            layer.bindPopup(popupContent).openPopup();
          });
  
          layer.on('mouseout', () => {
            layer.closePopup();
          });
  
          layer.bindPopup(popupContent);
          kreiseFeatures[name] = layer;
         
        },
      }).addTo(this.map);
  
      this.kreiseFeatures = kreiseFeatures;
    });

  }
  }
  
  async filterDataByDate(selectedDate: string[], bezirkData: any, kreisData: any) {
    let startDate, endDate;
    let filteredData;
  
    if (selectedDate.length === 1 && selectedDate[0] === '') {
      let latestDate;
      if (this.selectedFilter === 'regierungsbezirke') {
        latestDate = bezirkData.reduce((latest, item) => {
          const itemDate = new Date(item.formattedDate);
          return itemDate > latest ? itemDate : latest;
        }, new Date(0));
        filteredData = bezirkData.filter(item => item.formattedDate === latestDate.toISOString().split('T')[0]);
      } else if (this.selectedFilter === 'kreise') {
        latestDate = kreisData.reduce((latest, item) => {
          const itemDate = new Date(item.formattedDate);
          return itemDate > latest ? itemDate : latest;
        }, new Date(0));
        filteredData = kreisData.filter(item => item.formattedDate === latestDate.toISOString().split('T')[0]);
        console.log(filteredData)
      }
      startDate = latestDate;
      endDate = new Date(latestDate);
      document.getElementById('selectedDate').innerHTML = `Datum: ${startDate.toISOString().split('T')[0]}`;

    } else if (selectedDate.length === 1 && selectedDate[0] !== '') {

      if(this.selectedFilter === 'regierungsbezirke'){

      startDate = new Date(selectedDate[0]);
      startDate.setMinutes(startDate.getMinutes() - startDate.getTimezoneOffset());
      endDate = selectedDate[1] ? new Date(selectedDate[1]) : new Date(startDate);
      filteredData = bezirkData.filter(item => item.formattedDate === startDate.toISOString().split('T')[0]);

      }else if(this.selectedFilter === 'kreise'){
      startDate = new Date(selectedDate[0]);
      startDate.setMinutes(startDate.getMinutes() - startDate.getTimezoneOffset());
      endDate = selectedDate[1] ? new Date(selectedDate[1]) : new Date(startDate);
      filteredData = kreisData.filter(item => item.formattedDate === startDate.toISOString().split('T')[0]);

      }
      
      document.getElementById('selectedDate').innerHTML = `Datum: ${startDate.toISOString().split('T')[0]}`;
    } else if (selectedDate.length === 2) {
      if(this.selectedFilter === 'regierungsbezirke'){
        startDate = new Date(selectedDate[0]);
      startDate.setMinutes(startDate.getMinutes() - startDate.getTimezoneOffset());
      endDate = new Date(selectedDate[1]);
      endDate.setMinutes(endDate.getMinutes() - endDate.getTimezoneOffset());
      endDate.setHours(23, 59, 59, 999);
      filteredData = bezirkData.filter(item => {
        const itemDate = new Date(item.formattedDate);
        return itemDate >= startDate && itemDate <= endDate;
      });
      }else if(this.selectedFilter === 'kreise'){
        startDate = new Date(selectedDate[0]);
      startDate.setMinutes(startDate.getMinutes() - startDate.getTimezoneOffset());
      endDate = new Date(selectedDate[1]);
      endDate.setMinutes(endDate.getMinutes() - endDate.getTimezoneOffset());
      endDate.setHours(23, 59, 59, 999);
      filteredData = kreisData.filter(item => {
        const itemDate = new Date(item.formattedDate);
        return itemDate >= startDate && itemDate <= endDate;
      });

      }
      
      document.getElementById('selectedDate').innerHTML = `Datum: ${startDate.toISOString().split('T')[0]} - ${endDate.toISOString().split('T')[0]}`;
    }
  
    endDate.setHours(23, 59, 59, 999);
  
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('Invalid date value');
      return;
    }
  
    return { startDate, endDate, filteredData };
  }
  

  
  
  private mergeRegierungsbezirke(geoJSONData: any): any {
   
    const mergeMapping = {
     'Luneburg': 'Niedersachsen',
          'Hannover': 'Niedersachsen',
          'Weser-Ems': 'Niedersachsen',
          'Braunschweig': 'Niedersachsen',
          'Leipzig': 'Sachsen',
          'Dresden': 'Sachsen',
          'Chemnitz': 'Sachsen',
          'Halle': 'Sachsen-Anhalt',
          'Dessau': 'Sachsen-Anhalt',
          'Magdeburg': 'Sachsen-Anhalt',
          'Rheinhessen-Pfalz':'Rheinland-Pfalz',
          'Koblenz':'Rheinland-Pfalz',
          'Trier':'Rheinland-Pfalz',
    };
  
    const featuresToMerge = {};
    const newFeatures = geoJSONData.features.filter((feature) => {
      const name = feature.properties.NAME_2;
      if (mergeMapping[name]) {
        if (!featuresToMerge[mergeMapping[name]]) {
          featuresToMerge[mergeMapping[name]] = [];
        }
        featuresToMerge[mergeMapping[name]].push(feature);
        return false;
      }
      return true;
    });
  
    for (const stateName in featuresToMerge) {
      const mergedPolygon = featuresToMerge[stateName].reduce((merged, feature, index) => {
        if (index === 0) {
          return feature;
        } else {
          return turf.union(merged, feature);
        }
      }, null);
  
      mergedPolygon.properties = {
        ...mergedPolygon.properties,
        NAME_2: stateName,
      };
      newFeatures.push(mergedPolygon);
    }
  
    return { ...geoJSONData, features: newFeatures };
  }


   
  
    

  public onInputChange(inputText: string): void {
    if (!inputText) {
      return;
    }
  
    const getMergedRegierungsbezirkName = (inputText: string): string | null => {
      const stateMapping = {
        'Luneburg': 'Niedersachsen',
        'Hannover': 'Niedersachsen',
        'Weser-Ems': 'Niedersachsen',
        'Braunschweig': 'Niedersachsen',
        'Leipzig': 'Sachsen',
        'Dresden': 'Sachsen',
        'Chemnitz': 'Sachsen',
        'Halle': 'Sachsen-Anhalt',
        'Dessau': 'Sachsen-Anhalt',
        'Magdeburg': 'Sachsen-Anhalt',
        'Rheinhessen-Pfalz': 'Rheinland-Pfalz',
        'Koblenz':'Rheinland-Pfalz',
        'Trier': 'Rheinland-Pfalz',
      };
      return stateMapping[inputText] || null;
    };
  
    if (this.selectedFilter === "regierungsbezirke") {
      let searchResults = this.searchRegierungsbezirk(inputText);
      const mergedRegierungsbezirkName = getMergedRegierungsbezirkName(inputText);
      if (mergedRegierungsbezirkName) {
        searchResults = searchResults.concat(this.searchRegierungsbezirk(mergedRegierungsbezirkName));
      }
      if (searchResults.length === 1 && inputText.length > 1) {
        const result = searchResults[0];
        this.inputRegierungsbezirk = result;
  
        if (this.previousHighlightedLayer) {
          const defaultStyle = {
            color: '#000',
            weight: 1,
            opacity: 0.5,
          };
          (this.previousHighlightedLayer as L.Path).setStyle(defaultStyle);
        }
  
        const targetLayer = this.regierungsbezirkFeatures[result];
        this.map.fitBounds(targetLayer.getBounds());
        targetLayer.setStyle({
          color: '#ff7800',
          weight: 5,
          opacity: 0.65,
        });
        const [_, occupiedTime] = this.popupDataRegierungsbezirk.find(([name, _]) => name === result) || ["", ""];
        const popupContent = `Regierungsbezirk: ${result}<br>Totale Belegungszeit: ${occupiedTime}`;
        targetLayer.bindPopup(popupContent).openPopup();
  
        this.previousHighlightedLayer = targetLayer;
      }
    } else if (this.selectedFilter === "kreise") {
      const kreiseResults = this.searchKreise(inputText);
      if (kreiseResults.length === 1 && inputText.length > 1) {
        const result = kreiseResults[0];
  
        if (this.previousHighlightedLayer) {
          const defaultStyle = {
            color: '#000',
            weight: 1,
            opacity: 0.5,
          };
          (this.previousHighlightedLayer as L.Path).setStyle(defaultStyle);
        }
  
        const targetLayer = this.kreiseFeatures[result];
        this.map.fitBounds(targetLayer.getBounds());
        targetLayer.setStyle({
          color: '#ff7800',
          weight: 5,
          opacity: 0.65,
        });
        const [_, occupiedTime] = this.popupDataKreise.find(([name, _]) => name === result) || ["", ""];
      const popupContent = `Kreise: ${result}<br>Totale Belegungszeit: ${occupiedTime}`;
      targetLayer.bindPopup(popupContent).openPopup();
  
        this.previousHighlightedLayer = targetLayer;
      }
    }
  }
  

  
  private searchKreise(inputText: string): string[]{
    const kreiseName = Object.keys(this.kreiseFeatures);
    const filteredNames = kreiseName.filter(name =>
      name.toLowerCase().startsWith(inputText.toLocaleLowerCase()))
      return filteredNames;
  }
  private searchRegierungsbezirk(inputText: string): string[] {
    const regierungsbezirkNames = Object.keys(this.regierungsbezirkFeatures);
    const filteredNames = regierungsbezirkNames.filter(name =>
      name.toLowerCase().startsWith(inputText.toLowerCase())
    );
    return filteredNames;
  }
  

  
  private getRegierungsbezirkData(): Observable<any>{
    return this.http.get('/assets/bezirk.geojson')
  }

  private getFillColor(density: number, thresholds: number[]): string {
    if (density <= thresholds[1]) {
      return 'RGBA(0,111,122, 0.1)';
  } else if (density <= thresholds[2]) {
      return 'RGBA(0,111,122, 0.4)';
  } else if (density <= thresholds[3]) {
      return 'RGBA(0,111,122, 0.7)';
  } else if (density <= thresholds[4]) {
      return 'RGBA(0,111,122,1)';
  } else {
      return 'RGBA(220, 189, 35, 1)';
  }
  }

  
// private getFillColorBezirk(occupiedTime:number, colorThreshold:number):string{
//   if(occupiedTime > colorThreshold * 16){
//     return 'rgba(7, 48, 109, 0.9)';
//   }else if(occupiedTime > colorThreshold * 12){
//     return 'rgba(7, 48, 109, 0.7)'; 
//   }
//   else if (occupiedTime > colorThreshold*8) {
//     return 'rgba(7, 48, 109, 0.5)';
//   } else if(occupiedTime > colorThreshold*4){
//     return 'rgba(7, 48, 109, 0.3)';
//   } else {
//     return 'rgba(7, 48, 109, 0.1)'
//   }
// }



//   private getFillColorKreise(kreiseCount:number, colorThreshold:number):string{
//     if(kreiseCount > colorThreshold * 10){
//       return 'rgba(7, 48, 109, 0.9)';
//     }else if(kreiseCount> colorThreshold * 8){
//       return 'rgba(7, 48, 109, 0.7)'; 
//     }
//     else if (kreiseCount> colorThreshold*5) {
//       return 'rgba(7, 48, 109, 0.5)';
//     } else if(kreiseCount > colorThreshold*2){
//       return 'rgba(7, 48, 109, 0.3)';
//     } else {
//       return 'rgba(7, 48, 109, 0.1)'
//     }
//   }
  


  constructor(private apiService: SmartLabService, 
    private theme: NbThemeService, 
    
    private httpClient: HttpClient, 
    private renderer: Renderer2,
    private router: Router,
    private el: ElementRef,) 
    { this.http = httpClient;}

  iconGenerator(color: string) {
    return new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-' + color + '.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }

  
  
  ngAfterViewInit() {
    
    this.draggableLegend.nativeElement.style.position = 'absolute';
  }

  @HostListener('document:mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (this.draggableLegend.nativeElement.contains(event.target)) {
      this.active = true;

      this.initialX = event.clientX - this.xOffset;
      this.initialY = event.clientY - this.yOffset;
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.active) {
      event.preventDefault();

      this.currentX = event.clientX - this.initialX;
      this.currentY = event.clientY - this.initialY;

      this.xOffset = this.currentX;
      this.yOffset = this.currentY;

      this.draggableLegend.nativeElement.style.transform = 
        `translate3d(${this.currentX}px, ${this.currentY}px, 0)`;
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    if (this.active) {
      this.initialX = this.currentX;
      this.initialY = this.currentY;

      this.active = false;
    }
  }


ngOnInit(): void {

 this.initMap();
  
}


downloadImage(type:any){
  var node = document.getElementById('print');
  htmlToImage.toJpeg(node, { quality: 0.95 })
  .then(function (dataUrl) {
    var link = document.createElement('a');
    if(type=='jpeg'){
      link.download = 'maps'+Date.now()+'.jpeg';
    }
    else {
      link.download = 'maps'+Date.now()+'.png';
    }      
    link.href = dataUrl;
    link.click();
  });
}

private convertToCSV(data: any[], headerLabel: string): string {
  let csvRows = [];
  const header = [headerLabel, 'Totale Belegungszeit'];
  if (!this.addedHeaderLabels.has(headerLabel)) {
    this.addedHeaderLabels.add(headerLabel);
    csvRows.push(header.join(','));

    const stringRows = data.map(row => JSON.stringify(row));
    const uniqueRows = new Set(stringRows);
    const sanitizedData = Array.from(uniqueRows).map(row => JSON.parse(row));

    sanitizedData.forEach((row) => {
      const sanitizedRow = row.map((value, index) => {
        if (index === 1 && typeof value === 'number') {
          return value.toFixed(2);
        }
        return `"${'\u00A0'}${value}"`;
      });
      csvRows.push(sanitizedRow.join(','));
    });
  }
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
  this.addedHeaderLabels.clear();
}

}






  



