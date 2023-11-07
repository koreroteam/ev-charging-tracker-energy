import { Component, OnInit, ViewChild, ElementRef, Renderer2, AfterViewInit, HostListener } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import * as L from 'leaflet';
import { SmartLabService } from '../../service/evp/smartlabs.service';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as turf from '@turf/turf';
import { Router } from '@angular/router';
import * as htmlToImage from 'html-to-image';
import { threadId } from 'worker_threads';



@Component({
  selector: 'ngx-charging-infra-heat-map-power',
  templateUrl: './charging-infra-heat-map-power.component.html',
  styleUrls: ['./charging-infra-heat-map-power.component.scss']
})
export class ChargingInfraHeatMapPowerComponent implements OnInit, AfterViewInit {
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
    this.zipCodeFilterOption = 'regierungsbezirke';
    this.createMap();
  
    if (this.zipCodeFilterOption === 'regierungsbezirke') {
      this.renderRegierungsbezirkMap();
    }else if(this.zipCodeFilterOption === 'kreise'){
      this.renderKreiseMap();

    }
  }

  public async switchMap(view: string): Promise<void> {
     if (view === 'regierungsbezirke') {
      this.zipCodeFilterOption = 'regierungsbezirke';
      this.renderRegierungsbezirkMap();
    }else if(view ==='kreise'){
      this.zipCodeFilterOption = 'kreise';
      this.renderKreiseMap()
    }
  }
  


  
  private createMap(): void {
    if (this.map) {
      this.map.remove();
    }
  
    this.map = L.map('heatMapContainerPower', {
      center: [51.5200, 9.4050],
      zoom: 6,
    });
    document.getElementById('heatMapContainerPower').style.backgroundColor = "rgba(85,90,96,0.3)";
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
  
   
    const chargePointAreas = await this.apiService.getChargePointPowerByKreise();
    const chargePointsByKreise = chargePointAreas.reduce((acc, area) => {
      const county = area[0];
      const power = area[1];
  
      if (!acc[county]) {
        acc[county] = 0;
      }
  
      acc[county] += power;
      return acc;
    }, {});

    const chargePointsPowerCounts = Object.values(chargePointsByKreise);
    chargePointsPowerCounts.sort((a, b) => Number(a) - Number(b));
    console.log(chargePointsPowerCounts.sort((a, b) => Number(a) - Number(b)))
  
      
        const thresholds = [0, 0.2, 0.4, 0.6, 0.8].map(percent => {
          const index = Math.round(percent * (chargePointsPowerCounts.length - 1));
          return Number(chargePointsPowerCounts[index]);
        });
  console.log(thresholds)
  

  this.http.get(kreiseDataUrl).subscribe((data: any) => {
  
        if (this.geoJsonLayer) {
          this.map.removeLayer(this.geoJsonLayer);
        }
  
        const jsonCounties = new Set(Object.keys(chargePointsByKreise));
        const geoJsonCounties = [];
        const chargePointNr = [];
  
        this.geoJsonLayer = L.geoJSON(data, {
          style: (feature) => {
            const kreiseName = feature.properties.GEN;
            geoJsonCounties.push(kreiseName);
            const chargePoints = chargePointsByKreise[kreiseName] || 0;
            chargePointNr.push(chargePoints)
            const chargePointPower = chargePointsByKreise[kreiseName] || 0;
            
           
            const color = this.getFillColor(chargePointPower,thresholds);
            console.log(color)
            return {
              color: color,
              weight: 1,
              opacity: 1,
              fillOpacity: 0.8,
            };
          },
          onEachFeature: (feature, layer) => {
            
            const kreiseName = feature.properties.GEN;
            const chargePointPower = chargePointsByKreise[kreiseName] || 0;

            /*  const areaSize = this.DISTRICT_SIZES_Kreise.get(kreiseName) ?? 1;
            const chargePointDensity = chargePointPower / areaSize; */
            this.popupDataKreise.push([kreiseName, chargePointPower.toFixed(2)]);

             const popupContent = `Landkreis: ${kreiseName}<br>Installierte Leistung: ${chargePointPower} kWh`;
           
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
  
        // console.log("Counties in GeoJSON file:", geoJsonCounties);
        // console.log("Counties in JSON file not found on the map:", Array.from(jsonCounties));
        // console.log("ChargePoint in JSON loaded: ", chargePointNr)
      });
    
  }
  
  

  private async renderRegierungsbezirkMap(): Promise<void> {
    const regierungsbezirkFeatures = {};
  
    const chargePointAreas = await this.apiService.getChargePointPowerByBezirk();
    const chargePointsByBezirk = chargePointAreas.filter(([name]) => this.DISTRICT_SIZES.has(name)).reduce((acc, area) => {
      const county = area[0];
      const power = area[1];
  
      if (!acc[county]) {
        acc[county] = 0;
      }
  
      acc[county] += power;
      return acc;
    }, {});

    const chargePointPower = Object.values(chargePointsByBezirk);
    chargePointPower.sort((a, b) => Number(a) - Number(b));
    console.log(chargePointPower.sort((a, b) => Number(a) - Number(b)))
    


const thresholds = [0, 0.2, 0.4, 0.6, 0.8].map(percent => {
    const index = Math.round(percent * (chargePointPower.length - 1));
    return Number(chargePointPower[index]);
});

console.log(thresholds)
  
      this.getRegierungsbezirkData().subscribe((data) => {
        if (this.geoJsonLayer) {
          this.map.removeLayer(this.geoJsonLayer);
        }
  
        const mergedGeoJSON = this.mergeRegierungsbezirke(data);
        
  
        this.geoJsonLayer = L.geoJSON(mergedGeoJSON, {
          style: (feature) => {
            const name = feature.properties.NAME_2;
            const power = chargePointsByBezirk[name] ?? 0;
            
           
            const fillColor = this.getFillColor(power,thresholds);
  
            return {
              color: fillColor,
              weight: 1,
              opacity: 1,
              fillOpacity: 0.8,
            };
          },
  
          onEachFeature: (feature, layer) => {
            const name = feature.properties.NAME_2;
            const power = chargePointsByBezirk[name].toFixed(2) ?? 0;
            this.popupDataRegierungsbezirk.push([name, power]);
  
            const popupContent = `Regierungsbezirk: ${name}<br>Installierte Ladeleistung: ${power} kWh`;
            


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
  
        this.regierungsbezirkFeatures = regierungsbezirkFeatures;
      });
    
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

  private DISTRICT_SIZES: Map<string, number> = new Map([
    ["Schleswig-Holstein", 15804.3],
    ["Hamburg", 755.09],
    ["Niedersachsen", 47709.87],
    ["Bremen", 419.37],
    ["Düsseldorf", 5292.34],
    ["Köln", 7364.07],
    ["Munster", 6918.52],
    ["Detmold", 6525.28],
    ["Arnsberg", 8012.40],
    ["Darmstadt", 7444.25],
    ["Gießen", 5380.59],
    ["Kassel", 8290.79],
    ["Rheinland-Pfalz", 19857.97],
    ["Freiburg", 10556.86],
    ["Tübingen", 8917.00],
    ["Oberbayern", 17529.10],
    ["Niederbayern", 10325.93],
    ["Oberpfalz", 9690.12],
    ["Oberfranken", 7231.12],
    ["Mittelfranken", 7243.69],
    ["Schwaben", 9991.54],
    ["Unterfranken", 8530.07],
    ["Saarland", 2571.52],
    ["Berlin", 891.12],
    ["Brandenburg", 29654.37],
    ["Mecklenburg-Vorpommern", 23294.90],
    ["Sachsen-Anhalt", 20464.04],
    ["Thüringen", 16202.39],
    ["Sachsen", 18449.89],
    ["Stuttgart", 10556.86],
    ["Karlsruhe", 6917.61],
   
  ]);

  
    

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
        'Rheinhessen-Pfalz': 'Rheinland-Pfalz',
        'Koblenz':'Rheinland-Pfalz',
        'Trier': 'Rheinland-Pfalz',
      };
      return stateMapping[inputText] || null;
    };
  
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

  
  // private getFillColorBezirk(regierungsbezirkCount:number):string{
  //   if(regierungsbezirkCount > 200000){
  //     return 'rgba(255, 0, 0, 0.9)';
  //   }else if (regierungsbezirkCount > 150000) {
  //     return 'rgba(255, 0, 0, 0.7)'; 
  //   }else if(regierungsbezirkCount > 100000){
  //     return 'rgba(255, 0, 0, 0.5)'; 
  //   }
  //    else if (regierungsbezirkCount > 50000) {
  //     return 'rgba(255, 0, 0, 0.3)';
  //   } else {
  //     return 'rgba(255, 0, 0, 0.1)'
  //   }
  // }

  // private getFillColorKreise(kreiseCount:number):string{
  //   if(kreiseCount > 50000){
  //     return 'rgba(255, 0, 0, 0.9)';
  //   } else if (kreiseCount > 30000) {
  //     return 'rgba(255, 0, 0, 0.7)'; 
  //   } else if (kreiseCount > 15000) {
  //     return 'rgba(255, 0, 0, 0.5)'; 
  //   } else if (kreiseCount> 5000) {
  //     return 'rgba(255, 0, 0, 0.3)';
  //   } else {
  //     return 'rgba(255, 0, 0, 0.1)'
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
  const header = [headerLabel, 'Totale Ladeleistung'];
  let csvRows = [];

  if (!this.addedHeaderLabels.has(headerLabel)) {
    this.addedHeaderLabels.add(headerLabel);
    csvRows.push(header.join(','));

    const stringRows = data.map(row => JSON.stringify(row));
    const uniqueRows = new Set(stringRows);
    const sanitizedData = Array.from(uniqueRows).map(row => JSON.parse(row));

    sanitizedData.forEach((row) => {
      const sanitizedRow = row.map((value, index) => {
        if (index === 3 && typeof value === 'number') {
          return value.toFixed(2);
        }
        return `"${value}"`;
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






  



