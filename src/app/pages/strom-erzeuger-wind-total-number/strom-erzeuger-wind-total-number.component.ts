import { Component, OnInit, ViewChild, ElementRef, Renderer2, AfterViewInit, HostListener } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import * as L from 'leaflet';
import { SmartLabService } from '../../service/evp/smartlabs.service';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as turf from '@turf/turf';
import { Router } from '@angular/router';
import * as htmlToImage from 'html-to-image';



@Component({
  selector: 'ngx-strom-erzeuger-wind-total-number',
  templateUrl: './strom-erzeuger-wind-total-number.component.html',
  styleUrls: ['./strom-erzeuger-wind-total-number.component.scss']
})
export class StromErzeugerWindTotalNumberComponent implements OnInit, AfterViewInit {
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
  public inputRegierungsbezirk: string;
  public popupDataKreise: any[] = [];
  public popupDataRegierungsbezirk: any[] = [];
  public popupDataZipCode: any[] = [];
  public popupDataZipCode2D: any[] = [];
  private addedHeaderLabels = new Set<string>();
  public todaysDate : string;



  private async initMap(): Promise<void> {
    this.createMap();
      const chargePointsData = await this.getChargePointsDataZipCode();
      const data = await this.fetchData();
      this.renderMapZipCode(chargePointsData, data);
    
  }

  
  
  private createMap(): void {
    if (this.map) {
      this.map.remove();
    }
    document.getElementById('heatMapContainerWind').style.backgroundColor = "rgba(85,90,96,0.3)";
    this.map = L.map('heatMapContainerWind', {
      center: [51.5200, 9.4050],
      zoom: 6
    });
    
  }
  
  private async getChargePointsDataZipCode(): Promise<any> {
    const chargePointsData$ = this.apiService.getStromInfraWindInfo();
    const chargePointsData = await (await chargePointsData$).toPromise();

    // Filter for today's data
    const todaysDate = new Date().toISOString().split('T')[0];
    const todaysData = chargePointsData.filter(item => item.createdAtFormatted === todaysDate);

    // Map zip codes to nettonennLeistung
    const mappedData = todaysData.reduce((acc, item) => {
      acc[item.zipCode] = item.recordCount;
      return acc;
    }, {});

    // Extract nettonennLeistung values and sort them
    const leistungValues = todaysData.map(item => item.recordCount);
    leistungValues.sort((a, b) => a - b);

    // Determine thresholds, for example, by percentiles
    const thresholds = this.calculateThresholds(leistungValues);

    return { chargePointsData: mappedData, thresholds };
}

private calculateThresholds(values: number[]): number[] {
    const percentile = Math.ceil(values.length / 5);
    const thresholds = [];

    for (let i = 0; i < 5; i++) {
        const index = i * percentile;
        thresholds.push(values[index] || 0);
    }

    return thresholds;
}

  
  private async fetchData(): Promise<any> {
    return this.fetchZipcodeData().toPromise();
  }
  
  private renderMapZipCode({chargePointsData, thresholds}: {chargePointsData: any, thresholds: number[]}, data: any): void {
    const zipcodeFeatures = {};
    this.todaysDate = new Date().toISOString().split('T')[0];
    this.geoJsonLayer = L.geoJSON(data, {
      style: (feature) => {
        const zipcode = feature.properties.postcode;
        const recordCount = chargePointsData[zipcode] || 0;
  
        const fillColor = this.getFillColor(recordCount, thresholds);
  
        return {
          fillColor: fillColor,
          weight: 0.7,
          opacity: 0.5,
          color: 'grey',
          dashArray: '3',
          fillOpacity: 1
        };
      },
  
      onEachFeature: (feature, layer) => {
        const zipcode = feature.properties.postcode;
        const recordCount = chargePointsData[zipcode] || 0;
        
       
        const popupContent = `PLZ: ${zipcode}<br>Anzahl Strom Erzeuger Wind per Postleitzahl: ${recordCount}`;

          layer.on('mouseover', () => {
            layer.bindPopup(popupContent).openPopup();
             });
 
            layer.on('mouseout', () => {
            layer.closePopup();
             });
 
  
      layer.bindPopup(popupContent);
      
    
        zipcodeFeatures[zipcode] = layer;
      },
    }).addTo(this.map);
  
    this.zipcodeFeatures = zipcodeFeatures;
  }
  

 
  

  
  
  public onInputChange(event: Event): void {
    
    const inputText = (event.target as HTMLInputElement).value;

    if (!inputText) {
      return;
    }

    if (this.zipCodeFilterOption === "twoDigits" || this.zipCodeFilterOption === "all") {
      const layer = this.zipCodeFilterOption === 'twoDigits'
      ? this.zipcodeFeatures[inputText.slice(0, 2)]
      : this.zipcodeFeatures[inputText] || this.zipcodeFeatures[inputText.slice(0, 2)];
  

        if (layer) {
            if (this.previousHighlightedFeature) {
                this.geoJsonLayer.resetStyle(this.previousHighlightedFeature);
            }

            const bounds = (layer as L.Polygon).getBounds();
            this.map.fitBounds(bounds);

            (layer as L.Polygon).setStyle({
                weight: 5,
                color: '#666',
                dashArray: '',
                fillOpacity: 0.7,
            });

            (layer as L.Layer).openPopup();

            this.previousHighlightedFeature = layer;
        } /* else {
            alert('PLZ nicht gefunden!');
        } */
    } ;
}

  

  
  
  private fetchZipcodeData(): Observable<any> {
    return this.http.get('https://raw.githubusercontent.com/yetzt/postleitzahlen/main/data/postleitzahlen.small.geojson').pipe(
      map((data: any) => {
        if (this.zipCodeFilterOption === 'twoDigits') {
          data.features = this.groupFeaturesByTwoDigits(data.features);
        }
        return data;
      })
    );
  }
  
  
  private groupFeaturesByTwoDigits(features: any[]): any[] {
    const grouped = features.reduce((acc, feature) => {
      const twoDigitZip = feature.properties.postcode.slice(0, 2);
      if (!acc[twoDigitZip]) {
        acc[twoDigitZip] = feature;
      } else {
        const combined = turf.union(acc[twoDigitZip], feature);
        acc[twoDigitZip] = combined;
        acc[twoDigitZip].properties.postcode = twoDigitZip;
      }
      return acc;
    }, {});
  
    return Object.values(grouped);
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
  const header = [headerLabel, 'Anzahl Ladepunkte'];

  if (!this.addedHeaderLabels.has(headerLabel)) {
    this.addedHeaderLabels.add(headerLabel);
    csvRows.push(header.join(';'));

    // Convert each row to a string to compare later
    const stringRows = data.map(row => JSON.stringify(row));
    const uniqueRows = new Set(stringRows);
    const sanitizedData = Array.from(uniqueRows).map(row => JSON.parse(row));

    sanitizedData.forEach((row) => {
      const sanitizedRow = row.map((value, index) => {
        if (index === 3 && typeof value === 'number') {
          return `="${value}"`;
        }
        return `"${value}"`;
      });
      csvRows.push(sanitizedRow.join(';'));
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

}




}






  



