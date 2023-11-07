import { Component, OnInit, ViewChild, ElementRef, Renderer2, AfterViewInit, HostListener } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import * as L from 'leaflet';
import { SmartLabService } from '../../service/evp/smartlabs.service';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as turf from '@turf/turf';
import { Router } from '@angular/router';
import * as htmlToImage from 'html-to-image';
@Component({
  selector: 'ngx-charging-infra-heat-map-bevs-number',
  templateUrl: './charging-infra-heat-map-bevs-number.component.html',
  styleUrls: ['./charging-infra-heat-map-bevs-number.component.scss']
})
export class ChargingInfraHeatMapBevsNumberComponent implements OnInit, AfterViewInit {
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
  private addedHeaderLabels = new Set<string>();
  
  private async initMap(): Promise<void> {
    this.zipCodeFilterOption = 'kreise'
    this.renderKreiseMap();
    this.createMap();
  
   
  }
  
  
  
  private createMap(): void {
    if (this.map) {
      this.map.remove();
    }
  
    this.map = L.map('heatMapContainerBEVsNumber', {
      center: [51.5200, 9.4050],
      zoom: 6,
    });
    document.getElementById('heatMapContainerBEVsNumber').style.backgroundColor = "rgba(85,90,96,0.3)";
  
    // const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   maxZoom: 18,
    //   minZoom: 3,
    //   boundary: this.latLngGeom,
    // });
  
    // tiles.addTo(this.map);
  }
  
  private async renderKreiseMap(): Promise<void> {
    const kreiseFeatures = {};
  
    const kreiseDataUrl = '/assets/vg250_krs.geojson';
  
   
    const chargePointAreas = await this.apiService.getChargePointsByKreise();
    
    const rates = Object.values(chargePointAreas).map(({ count, gesamt_bevs }) =>
    Number((count / gesamt_bevs).toFixed(2)) );
    rates.sort((a, b) => a - b);
  const thresholds = [0, 0.2, 0.4, 0.6, 0.8].map(percent => {
    const index = Math.round(percent * (rates.length - 1));
    return rates[index];
  });
  console.log(thresholds)
    this.http.get(kreiseDataUrl).subscribe((data: any) => {
  
      if (this.geoJsonLayer) {
        this.map.removeLayer(this.geoJsonLayer);
      }
    
      const jsonCounties = new Set(Object.keys(chargePointAreas));
      const geoJsonCounties = [];
      const chargePointNr = [];
    
      this.geoJsonLayer = L.geoJSON(data, {
        style: (feature) => {
          const kreiseName = feature.properties.GEN;
          geoJsonCounties.push(kreiseName);
          const chargePointData = chargePointAreas[kreiseName] || { gesamt_bevs: 0, count: 0 };
          const gesamt_bevs = chargePointData["gesamt_bevs"];
          const count = chargePointData["count"];
          const rate = Number((count / gesamt_bevs).toFixed(2));
          
          const color = this.getFillColor(rate,thresholds);
       //   console.log(color)
          return {
            color: color,
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
          };
        },
       
    
          onEachFeature: (feature, layer) => {
            
            const kreiseName = feature.properties.GEN;
            const chargePointData = chargePointAreas[kreiseName] || { gesamt_bevs: 0, count: 0 };
            const gesamt_bevs = chargePointData["gesamt_bevs"];
            const count = chargePointData["count"];

        this.popupDataKreise.push([kreiseName,count,gesamt_bevs, (count / gesamt_bevs).toFixed(2)]);

        const popupContent = `Landkreis: ${kreiseName}<br>Anzahl Ladepunkte: ${count}<br>Anzahl BEV: ${gesamt_bevs}<br>Ladepunkte je BEV: ${(count / gesamt_bevs).toFixed(2)}`;

            layer.on('mouseover', () => {
              layer.bindPopup(popupContent).openPopup();
               });
   
              layer.on('mouseout', () => {
              layer.closePopup();
               });
   
            layer.bindPopup(popupContent);
            kreiseFeatures[kreiseName] = layer;
          
            jsonCounties.delete(kreiseName);
          }
          
        }).addTo(this.map);
        this.kreiseFeatures = kreiseFeatures;
  
       
      });
    
  }
  
  
  
    
  public onInputChange(event: Event): void {
    const inputText = (event.target as HTMLInputElement).value;
  
    if (!inputText) {
      return;
    }
  
    if (this.zipCodeFilterOption === "kreise") {
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
      targetLayer.openPopup();
  
      this.previousHighlightedLayer = targetLayer;
    }
    } 
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
  
  private searchKreise(inputText: string): string[]{
    const kreiseName = Object.keys(this.kreiseFeatures);
    const filteredNames = kreiseName.filter(name =>
      name.toLowerCase().startsWith(inputText.toLocaleLowerCase()))
      return filteredNames;
  }
  
  // private getFillColorKreise(kreiseCount:number):string{
  //   if(kreiseCount > 0.20){
  //     return 'rgba(7, 48, 109, 0.9)';
  //   } else if (kreiseCount > 0.15) {
  //     return 'rgba(7, 48, 109, 0.7)'; 
  //   } else if (kreiseCount > 0.10) {
  //     return 'rgba(7, 48, 109, 0.5)'; 
  //   } else if (kreiseCount> 0.05) {
  //     return 'rgba(7, 48, 109, 0.3)';
  //   } else {
  //     return 'rgba(7, 48, 109, 0.1)'
  //   }
  // }
  
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
  const header = [headerLabel,'Anzahl der Ladepunkte', 'Anzahl der BEVs','Ladepunkt per BEVs'];
  let csvRows = [];
 
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
