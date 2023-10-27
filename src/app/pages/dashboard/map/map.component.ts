import { AfterViewInit, Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { ActivatedRoute, Router } from '@angular/router';
import { SmartLabService } from '../../../service/evp/smartlabs.service';
import * as moment from 'moment';
import { delay, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { Observable } from 'rxjs';
import * as turf from '@turf/turf';

@Component({
  selector: 'ngx-map',
  styleUrls: ['./map.component.scss'],
  templateUrl: './map.component.html',
})

export class MapComponent implements OnInit, AfterViewInit {
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





  


  
  private async initMap(): Promise<void> {
    this.createMap();

      this.renderRegierungsbezirkMap();
   
  }

  public async switchMap(view: string): Promise<void> {
    if (view === 'all') {
      this.zipCodeFilterOption = 'all';
      await this.initMap();
    } else if (view === '2-stellig') {
      this.zipCodeFilterOption = 'twoDigits';
      await this.initMap();
    } else if (view === 'regierungsbezirke') {
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
  
    this.map = L.map('heatMapContainer', {
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
  
 
  

 
  private renderRegierungsbezirkMap(): void {
    const regierungsbezirkFeatures = {};
  
    this.apiService.getChargePointsByDistricts().then((chargePointsByDistricts) => {
      this.getRegierungsbezirkData().subscribe((data) => {
        if (this.geoJsonLayer) {
          this.map.removeLayer(this.geoJsonLayer);
        }

        
  
        const mergedGeoJSON = this.mergeRegierungsbezirke(data);
        const jsonBezirke = new Set(Object.keys(chargePointsByDistricts));
        const geoJsonBezirke = [];
  
      
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
  
        let mergedChargePointsByDistricts = {};
        for (const [key, value] of Object.entries(chargePointsByDistricts)) {
          const newKey = mergeMapping[key] || key;
          mergedChargePointsByDistricts[newKey] = (mergedChargePointsByDistricts[newKey] || 0) + value;
        }
  
        const districtNames = mergedGeoJSON.features.map(feature => feature.properties.NAME_2);
  
        const filteredChargePointsByDistricts = Object.entries(mergedChargePointsByDistricts)
          .filter(([key, value]) => districtNames.includes(key))
          .reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
          }, {});
  
        // Compute the thresholds
        const chargePointsCounts = Object.values(filteredChargePointsByDistricts);
        chargePointsCounts.sort((a, b) => Number(a) - Number(b));
        
        const thresholds = [0, 0.2, 0.4, 0.6, 0.8].map(percent => {
          const index = Math.round(percent * (chargePointsCounts.length - 1));
          return Number(chargePointsCounts[index]);
        });
        console.log(thresholds)
    
        this.geoJsonLayer = L.geoJSON(mergedGeoJSON, {
          style: (feature) => {
            const name = feature.properties.NAME_2;
            geoJsonBezirke.push(name)

            const count = chargePointsByDistricts[name] ?? 0;
            const fillColor = this.getFillColor(count,thresholds);
           // console.log(fillColor,name,count)
    
            return {
              color: '#000',
              weight: 1,
              opacity: 0.5,
              fillOpacity: 0.5,
              fillColor: fillColor,
            };
          },
  
          onEachFeature: (feature, layer) => {
            const name = feature.properties.NAME_2;
            const count = chargePointsByDistricts[name] ?? 0;
            this.popupDataRegierungsbezirk.push([name,count]);
  
            const popupContent = `Regierungsbezirk: ${name}<br>Anzahl Ladepunkte: ${count}`;

            layer.on('mouseover', () => {
              layer.bindPopup(popupContent).openPopup();
               });
   
              layer.on('mouseout', () => {
              layer.closePopup();
               });
   
  
            layer.bindPopup(popupContent);
            regierungsbezirkFeatures[name] = layer;
            jsonBezirke.delete(name);
          },
        }).addTo(this.map);
       
        this.regierungsbezirkFeatures = regierungsbezirkFeatures;
        console.log("Counties in GeoJSON file:", geoJsonBezirke);
        console.log("Counties in JSON file not found on the map:", Array.from(jsonBezirke));
      });
      
    });
  }

  private async renderKreiseMap(): Promise<void> {
    const kreiseFeatures = {};
  
    const kreiseDataUrl = '/assets/vg250_krs.geojson';
  
   
    const chargePointAreas = await this.apiService.getChargePointsByArea();
    const chargePointsByKreise = chargePointAreas.reduce((acc, area) => {
    const county = area.administrative_area_level_3;

    if (!acc[county]) {
    acc[county] = 0;
                }
   acc[county]++;
   return acc;
   }, {});

   const chargePointsCounts = Object.values(chargePointsByKreise);
        chargePointsCounts.sort((a, b) => Number(a) - Number(b));
  
      
        const thresholds = [0, 0.2, 0.4, 0.6, 0.8].map(percent => {
          const index = Math.round(percent * (chargePointsCounts.length - 1));
          return Number(chargePointsCounts[index]);
        });

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
            
            const color = this.getFillColor(chargePoints,thresholds);
            return {
              fillColor: color,
              weight: 1,
              opacity: 0.5,
              color: 'black',
              dashArray: '3',
              fillOpacity: 0.5
            };
          },
          onEachFeature: (feature, layer) => {
            const kreiseName = feature.properties.GEN;
            const chargePoints = chargePointsByKreise[kreiseName] || 0;
            this.popupDataKreise.push([kreiseName,chargePoints])
          
            const popupContent = `Landkreis: ${kreiseName}<br>Anzahl Ladepunkte: ${chargePoints}`;
            
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
  
        console.log("Counties in GeoJSON file:", geoJsonCounties);
        console.log("Counties in JSON file not found on the map:", Array.from(jsonCounties));
        console.log("ChargePoint in JSON loaded: ", chargePointNr)
      
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









}






  



