import { Component, OnInit, ViewChild, ElementRef, Renderer2, AfterViewInit, HostListener } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import * as L from 'leaflet';
import { SmartLabService } from '../../service/evp/smartlabs.service';
import { CountryOrdersMapService } from '../e-commerce/country-orders/map/country-orders-map.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as turf from '@turf/turf';
import { Router } from '@angular/router';
import * as htmlToImage from 'html-to-image';



interface ChargePointData {
  id: number;
  ratio: string;
  createdAt: string;
  zipCode: string;
  totalMaximumPower: number;
  totalNettoProduction: number;
}


@Component({
  selector: 'ngx-strom-erzeuger-solar-netto-leistung-ratio',
  templateUrl: './strom-erzeuger-solar-netto-leistung-ratio.component.html',
  styleUrls: ['./strom-erzeuger-solar-netto-leistung-ratio.component.scss']
})
export class StromErzeugerSolarNettoLeistungRatioComponent implements OnInit, AfterViewInit {
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
  public popupDataZipCode: any[] = [];
  public popupDataZipCode2D: any[] = [];
  private addedHeaderLabels = new Set<string>();



  selectedTime: string;

  
  async onTimeSelected(time: string) {
    const {filteredChargePointsData, thresholds} = await this.getChargePointsDataZipCode(time);
    const data = await this.fetchData();
    this.renderMapZipCode({filteredChargePointsData, thresholds}, data);
}



  
  
//   async filterDataByTime() {
//     const chargePointsData$ = this.apiService.getStromRatio();
  
//     (await chargePointsData$).pipe(
//       map(data => data.filter(item => {
//         const createdAtTime = new Date(item.createdAt).getHours() + ":" + ("0" + new Date(item.createdAt).getMinutes()).slice(-2);
//         return createdAtTime === this.selectedTime;
//       }))
//     ).subscribe(async (filteredData) => {
//         console.log(filteredData);
//         const data = await this.fetchData();
//         this.renderMapZipCode({filteredChargePointsData: filteredData, thresholds: filteredData.thresholds}, data); 
//     });
// }


  
  private async initMap(): Promise<void> {
    this.createMap();
    this.selectedTime = "10:00"
    const chargePointsData = await this.getChargePointsDataZipCode(this.selectedTime);
    const data = await this.fetchData();
    this.renderMapZipCode({filteredChargePointsData: chargePointsData.filteredChargePointsData, thresholds: chargePointsData.thresholds}, data);
}


  // public async switchMap(view: string): Promise<void> {
  //   if (view === 'all') {
  //     this.zipCodeFilterOption = 'all';
  //     await this.initMap();
  //   } else if (view === '2-stellig') {
  //     this.zipCodeFilterOption = 'twoDigits';
  //     await this.initMap();
  //   } else if (view === 'regierungsbezirke') {
  //     this.zipCodeFilterOption = 'regierungsbezirke';
  //     this.renderRegierungsbezirkMap();
  //   }else if(view ==='kreise'){
  //     this.zipCodeFilterOption = 'kreise';
  //     this.renderKreiseMap()
  //   }
  // }
  
  
  private createMap(): void {
    if (this.map) {
      this.map.remove();
    }
  
    this.map = L.map('heatMapContainerSolarLeistungRatio', {
      center: [51.5200, 9.4050],
      zoom: 6
    });
    
  
    // const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   maxZoom: 18,
    //   minZoom: 3,
    //   boundary: this.latLngGeom,
    // });
  
    // tiles.addTo(this.map);
  }
  


  private async getChargePointsDataZipCode(selectedTime: string): Promise<any> {
    const chargePointsData$ = await (await this.apiService.getStromRatio()).toPromise() as ChargePointData[];

    // Fetch the GeoJSON data
    const geoJSONData = await this.http.get('https://raw.githubusercontent.com/yetzt/postleitzahlen/main/data/postleitzahlen.small.geojson').toPromise() as any;

    // Extract the zip codes from the GeoJSON data
    const geoJSONZipCodes: string[] = geoJSONData.features.map(feature => {
       
            return feature.properties.postcode;
        
        
    }).filter(zip => zip !== null);

    const filteredChargePointsData = chargePointsData$.filter((item: ChargePointData) => {
      const date = new Date(item.createdAt);
      date.setMinutes(date.getMinutes() - 120);
      const createdAtTime = date.getHours() + ":" + ("0" + date.getMinutes()).slice(-2);
      

        
        console.log(createdAtTime)
        // Only include items with zip codes that exist in the GeoJSON data
        return createdAtTime === selectedTime && geoJSONZipCodes.includes(item.zipCode);
    });

    const chargePointsCounts = filteredChargePointsData.map(data => Number(data.ratio));
    chargePointsCounts.sort((a, b) => a - b);

    const thresholds = [0, 0.2, 0.4, 0.6, 0.8].map(percent => {
        const index = Math.round(percent * (chargePointsCounts.length - 1));
        return chargePointsCounts[index];
    });

    return { filteredChargePointsData, thresholds };
}



  
  private async fetchData(): Promise<any> {
    return this.fetchZipcodeData().toPromise();
  }
  
  private renderMapZipCode({filteredChargePointsData, thresholds}: {filteredChargePointsData: ChargePointData[], thresholds: number[]}, data: any): void {
    const zipcodeFeatures = {};

    if (this.geoJsonLayer) {
      this.geoJsonLayer.remove();
  }
  

    this.geoJsonLayer = L.geoJSON(data, {
      style: (feature) => {
        const zipcode = feature.properties.postcode;
        const matchedData = filteredChargePointsData.find(item => item.zipCode === zipcode);
        const chargePointsCount = matchedData ? Number(matchedData.ratio) : 0;
        const fillColor = this.getFillColor(chargePointsCount, thresholds);

        return {
          color: fillColor,
          weight: 1,
          opacity: 0.5,
          fillOpacity: 0.5,
        };
      },
  
      onEachFeature: (feature, layer) => {
        const zipcode = feature.properties.postcode;
        const matchedData = filteredChargePointsData.find(item => item.zipCode === zipcode);
        const chargePointsCount = matchedData ? Number(matchedData.ratio) : 0;

        if(this.zipCodeFilterOption === "all"){
          this.popupDataZipCode.push([zipcode, chargePointsCount]);
        }

        const popupContent = `PLZ: ${zipcode}<br>Ratio: ${chargePointsCount.toFixed(5)}<br>time: ${this.selectedTime}`;

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
        'Rheinhessen-Pfalz':'Rheinland-Pfalz',
        'Koblenz':'Rheinland-Pfalz',
        'Trier':'Rheinland-Pfalz',
      };
      return stateMapping[inputText] || null;
    };
  

    /* if (!this.isValidZipCodeInput(inputText)) {
      if (this.zipCodeFilterOption === 'twoDigits') {
        alert('Bitte eine 2-stellige PLZ eingeben!');
      } else {
        alert('Bitte eine 5-stellige PLZ eingeben!');
      }
      return;
    } */

    if (this.zipCodeFilterOption === "regierungsbezirke") {
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
      targetLayer.openPopup();
  
      this.previousHighlightedLayer = targetLayer;

    } }else if (this.zipCodeFilterOption === "kreise") {
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

    } else if (this.zipCodeFilterOption === "twoDigits" || this.zipCodeFilterOption === "all") {
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

  
  
  private searchRegierungsbezirk(inputText: string): string[] {
    const regierungsbezirkNames = Object.keys(this.regierungsbezirkFeatures);
    const filteredNames = regierungsbezirkNames.filter(name =>
      name.toLowerCase().startsWith(inputText.toLowerCase())
    );
    return filteredNames;
  }
  
  private searchKreise(inputText: string): string[]{
    const kreiseName = Object.keys(this.kreiseFeatures);
    const filteredNames = kreiseName.filter(name =>
      name.toLowerCase().startsWith(inputText.toLocaleLowerCase()))
      return filteredNames;
  } 
  
  private getRegierungsbezirkData(): Observable<any>{
    return this.http.get('https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/main/3_regierungsbezirke/2_hoch.geo.json')
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
  
  
  
  
  
  private getChargePointsCountKey(zipcode: string): string {
    return zipcode;
  }

private getFillColor(density: number, thresholds: number[]): string {
  if (!thresholds || thresholds.length < 5) {
    console.error("Thresholds array is not properly defined or is too short:", thresholds);
    return 'rgba(0, 0, 0, 0)';  
}
    if (density <= thresholds[1]) {
        return 'rgba(243, 249, 255, 1)';
    } else if (density <= thresholds[2]) {
        return 'rgba(175, 209, 231, 1)';
    } else if (density <= thresholds[3]) {
        return 'rgba(62, 142, 196, 1)';
    } else if (density <= thresholds[4]) {
        return 'rgba(8, 48, 107, 1)';
    } else {
        return 'rgba(0, 0, 55, 1)';
    }
}


  // private getFillColor(chargePoints: number): string {
  //   if (chargePoints === 0) {
  //     return 'rgba(255, 0, 0, 0.1)'; // no charge points
  //   } else if (chargePoints < 10) {
  //     return 'rgba(255, 0, 0, 0.3)'; // 1-9 charge points
  //   } else if (chargePoints < 50) {
  //     return 'rgba(255, 0, 0, 0.5)'; // 10-49 charge points
  //  } else if (chargePoints < 100) {
  //     return 'rgba(255, 0, 0, 0.7)'; // 50-99 charge points
  //  } else {
  //     return 'rgba(255, 0, 0, 0.9)'; // more than 100 charge points
  //   }
  // }
  
  // private getFillColorTwoDigits(chargePointsCount: number): string {
  //   if (chargePointsCount > 1999) {
  //     return 'rgba(255, 0, 0, 0.9)';
  //   } else if (chargePointsCount > 1499) {
  //     return 'rgba(255, 0, 0, 0.7)'; 
  //   } else if (chargePointsCount > 999) {
  //     return 'rgba(255, 0, 0, 0.5)';
  //   } else if (chargePointsCount > 499) {
  //     return 'rgba(255, 0, 0, 0.3)';
  //   } else {
  //     return 'rgba(255, 0, 0, 0.1)'
  //   }
  // }

  // private getFillColorBezirk(chargePoints:number,maxChargePointsCount:number,minChargePointsCount:number):string{
  //   if (chargePoints <= minChargePointsCount + (maxChargePointsCount - minChargePointsCount) * 0.2) {
  //     return 'rgba(255, 0, 0, 0.1)'; 
  // } else if (chargePoints <= minChargePointsCount + (maxChargePointsCount - minChargePointsCount) * 0.4) {
  //     return 'rgba(255, 0, 0, 0.3)';
  // } else if (chargePoints <= minChargePointsCount + (maxChargePointsCount - minChargePointsCount) * 0.6) {
  //     return 'rgba(255, 0, 0, 0.5)'; 
  // } else if (chargePoints <= minChargePointsCount + (maxChargePointsCount - minChargePointsCount) * 0.8) {
  //     return 'rgba(255, 0, 0, 0.7)'; 
  // } else {
  //     return 'rgba(255, 0, 0, 0.9)'; 
  // }
  // }

  // private getFillColorKreise(chargePoints:number,maxChargePointsCount:number,minChargePointsCount:number):string{
  //   if (chargePoints <= minChargePointsCount + (maxChargePointsCount - minChargePointsCount) * 0.2) {
  //     return 'rgba(255, 0, 0, 0.1)'; 
  // } else if (chargePoints <= minChargePointsCount + (maxChargePointsCount - minChargePointsCount) * 0.4) {
  //     return 'rgba(255, 0, 0, 0.3)';
  // } else if (chargePoints <= minChargePointsCount + (maxChargePointsCount - minChargePointsCount) * 0.6) {
  //     return 'rgba(255, 0, 0, 0.5)'; 
  // } else if (chargePoints <= minChargePointsCount + (maxChargePointsCount - minChargePointsCount) * 0.8) {
  //     return 'rgba(255, 0, 0, 0.7)'; 
  // } else {
  //     return 'rgba(255, 0, 0, 0.9)'; 
  // }
  // }
  
  

  constructor(private apiService: SmartLabService, 
    private theme: NbThemeService, 
    private ecMapService: CountryOrdersMapService, 
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






  




