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
  selector: 'ngx-charging-infra-heat-map-power-population',
  templateUrl: './charging-infra-heat-map-power-population.component.html',
  styleUrls: ['./charging-infra-heat-map-power-population.component.scss']
})
export class ChargingInfraHeatMapPowerPopulationComponent implements OnInit, AfterViewInit {
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
    document.getElementById('heatMapContainerPowerPopulation').style.backgroundColor = "rgba(85,90,96,0.3)";
    this.map = L.map('heatMapContainerPowerPopulation', {
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

    const densities = Object.entries(chargePointsByKreise).map(([name, count]) => {
      const areaSize = this.DISTRICT_Population_Kreise.get(name) ?? 1;
      return (typeof count === 'number' ? count : Number(count)) / areaSize;  
    }).sort((a, b) => a - b);
    
    const thresholds = [0, 0.2, 0.4, 0.6, 0.8].map(percent => {
      const index = Math.round(percent * (densities.length - 1));
      return densities[index];
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
            
            const chargePointPower = chargePointsByKreise[kreiseName] || 0;
            const areaPopulation = this.DISTRICT_Population_Kreise.get(kreiseName) ?? 1;
            const chargePointDensity = chargePointPower / areaPopulation; 
            
           
            const color = this.getFillColor(chargePointDensity,thresholds);
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

            const areaPopulation = this.DISTRICT_Population_Kreise.get(kreiseName) ?? 1;
            const chargePointDensity = (chargePointPower / areaPopulation).toFixed(2); 
            this.popupDataKreise.push([kreiseName, chargePointDensity]);

             const popupContent = `Landkreis: ${kreiseName}<br>Installierte Leistung je Einwohner/km²: ${chargePointDensity} kWh`;
           
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
    const chargePointsByBezirk = chargePointAreas.reduce((acc, area) => {
      const county = area[0];
      const power = area[1];
  
      if (!acc[county]) {
        acc[county] = 0;
      }
  
      acc[county] += power;
      return acc;
    }, {});

    const chargePointPower = Object.entries(chargePointsByBezirk)
    .filter(([name]) => this.DISTRICT_Population.has(name))
    .map(([name, count]) => {
        const areaSize = this.DISTRICT_Population.get(name) ?? 1;
        return (typeof count === 'number' ? count : Number(count)) / areaSize;  
    })
    .sort((a, b) => a - b);

console.log(chargePointPower);

const thresholds = [0, 0.2, 0.4, 0.6, 0.8].map(percent => {
    const index = Math.round(percent * (chargePointPower.length - 1));
    return chargePointPower[index];
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
            const areaPopulation = this.DISTRICT_Population.get(name) ?? 1;
            const chargePointDensity = (power / areaPopulation); 
            
           
            const fillColor = this.getFillColor(chargePointDensity,thresholds);
  
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
            const areaPopulation = this.DISTRICT_Population.get(name) ?? 1;
            const chargePointDensity = (power / areaPopulation).toFixed(2); 
            this.popupDataRegierungsbezirk.push([name, chargePointDensity]);
  
            const popupContent = `Regierungsbezirk: ${name}<br>Installierte Leistung je Einwohner/km²: ${chargePointDensity} kWh`;
            


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

  private DISTRICT_Population: Map<string, number> = new Map([
    ["Schleswig-Holstein", 185],
    ["Hamburg", 2455],
    ["Niedersachsen", 168],
    ["Bremen", 1613],
    ["Düsseldorf", 982],
    ["Köln", 607],
    ["Munster", 380],
    ["Detmold", 315],
    ["Arnsberg", 445],
    ["Darmstadt", 541],
    ["Gießen", 195],
    ["Kassel", 147],
    ["Rheinland-Pfalz", 207],
    ["Freiburg", 244],
    ["Tübingen", 210],
    ["Oberbayern", 270],
    ["Niederbayern", 121],
    ["Oberpfalz", 115],
    ["Oberfranken", 147],
    ["Mittelfranken", 245],
    ["Schwaben", 192],
    ["Unterfranken", 155],
    ["Saarland", 382],
    ["Berlin", 4127],
    ["Brandenburg", 86],
    ["Mecklenburg-Vorpommern", 69],
    ["Sachsen-Anhalt", 106],
    ["Thüringen", 130],
    ["Sachsen", 219],
    ["Stuttgart", 393],
    ["Karlsruhe", 407],
   
  ]);

  private DISTRICT_Population_Kreise: Map<string, number> = new Map([
    
   
    
     ["Flensburg", 1606],
  ["Kiel", 2075],
  ["Kreisfreie Stadt Lübeck", 1010],
  ["Kreisfreie Stadt Neumünster", 1109],
  ["Dithmarschen", 94],
  ["Herzogtum Lauenburg", 159],
  ["Nordfriesland", 80],
  ["Ostholstein", 145],
  ["Pinneberg", 479],
  ["Kreis Plön", 120],
  ["Kreis Rendsburg-Eckernförde", 126],
  ["Schleswig-Flensburg", 98],
  ["Segeberg", 209],
  ["Steinburg", 124],
  ["Stormarn", 320],
  ["Hamburg", 2455],
  ["Kreisfreie Stadt Braunschweig", 1291],
  ["Kreisfreie Stadt Salzgitter", 462],
  ["Kreisfreie Stadt Wolfsburg", 606],
  ["Gifhorn", 113],
  ["Landkreis Goslar", 139],
  ["Helmstedt", 135],
  ["Northeim", 104],
  ["Landkreis Peine", 255],
  ["Wolfenbüttel", 165],
  ["Göttingen", 184],
  ["Region Hannover", 504],
  ["Landkreis Diepholz", 110],
  ["Hameln-Pyrmont", 187],
  ["Landkreis Hildesheim", 227],
  ["Holzminden", 101],
  ["Landkreis Nienburg/Weser", 87],
  ["Schaumburg", 234],
  ["Celle", 116],
  ["Cuxhaven", 97],
  ["Landkreis Harburg", 206],
  ["Lüchow-Dannenberg", 39],
  ["Lüneburg", 139],
  ["Osterholz", 176],
  ["Rotenburg (Wümme)", 80],
  ["Landkreis Heidekreis", 76],


 ['Landkreis Stade', 163],
  ['Uelzen', 64],
  ['Verden', 175],
  ['Delmenhorst', 1241],
  ['Emden', 441],
  ['Kreisfreie Stadt Oldenburg', 1653],
  ['Kreisfreie Stadt Osnabrück', 1378],
  ['Wilhelmshaven', 700],
  ['Ammerland', 173],
  ['Aurich', 148],
  ['Landkreis Cloppenburg', 122],
  ['Emsland', 115],
  ['Friesland', 162],
  ['Grafschaft Bentheim', 141],
  ['Leer (Ostfriesland)', 159],
  ['Oldenburg', 124],
  ['Osnabrück', 170],
  ['Vechta', 178],
  ['Wesermarsch', 107],
  ['Wittmund', 87],
  ['Bremen', 1772],
  ['Bremerhaven', 1115],
  ['Düsseldorf', 2849],
  ['Duisburg', 2127],
  ['Essen', 2755],
  ['Krefeld', 1648],
  ['Mönchengladbach', 1531],
  ['Kreisfreie Stadt Mülheim an der Ruhr', 1870],
  ['Kreisfreie Stadt Oberhausen', 2708],
  ['Kreisfreie Stadt Remscheid', 1500],
  ['Kreisfreie Stadt Solingen', 1775],
  ['Kreisfreie Stadt Wuppertal', 2106],
  ['Kreis Kleve', 255],
  ['Mettmann', 1190],
  ['Rhein-Kreis Neuss', 785],
  ['Kreis Viersen', 530],
  ['Wesel', 442],
  ['Bonn', 2353],
  ['Kreisfreie Stadt Köln', 2650],
  ['Kreisfreie Stadt Leverkusen', 2077],
  ['Aachen', 787],
  ['Düren', 283],
  ['Rhein-Erft-Kreis', 670],
  ['Kreis Euskirchen', 156],
  ['Heinsberg', 411],



 ['Oberbergischer Kreis', 296],
  ['Rheinisch-Bergischer Kreis', 648],
  ['Rhein-Sieg-Kreis', 521],
  ['Kreisfreie Stadt Bottrop', 1166],
  ['Kreisfreie Stadt Gelsenkirchen', 2479],
  ['Kreisfreie Stadt Münster', 1048],
  ['Borken', 263],
  ['Coesfeld', 199],
  ['Recklinghausen', 805],
  ['Steinfurt', 251],
  ['Warendorf', 211],
  ['Kreisfreie Stadt Bielefeld', 1290],
  ['Gütersloh', 378],
  ['Herford', 556],
  ['Höxter', 117],
  ['Lippe', 278],
  ['Minden-Lübbecke', 270],
  ['Kreis Paderborn', 248],
  ['Bochum', 2495],
  ['Dortmund', 2091],
  ['Hagen', 1176],
  ['Hamm', 792],
  ['Kreisfreie Stadt Herne', 3046],
  ['Ennepe-Ruhr-Kreis', 786],
  ['Hochsauerlandkreis', 132],
  ['Märkischer Kreis', 383],
  ['Olpe', 187],
  ['Siegen-Wittgenstein', 242],
  ['Soest', 228],
  ['Unna', 724],
  ['Kreisfreie Stadt Darmstadt', 1308],
  ['Kreisfreie Stadt Frankfurt am Main', 3058],
  ['Kreisfreie Stadt Offenbach am Main', 2925],
  ['Kreisfreie Stadt Wiesbaden', 1368],
  ['Kreis Bergstraße', 377],
  ['Darmstadt-Dieburg', 451],
  ['Groß-Gerau', 610],
  ['Hochtaunuskreis', 492],
  ['Main-Kinzig-Kreis', 303],
  ['Main-Taunus-Kreis', 1075],
  ['Odenwaldkreis', 155],
  ['Offenbach', 1003],
  ['Rheingau-Taunus-Kreis', 231],
  ['Wetteraukreis', 283],
  ['Landkreis Gießen', 319],
  ['Lahn-Dill-Kreis', 238],
  ['Limburg-Weilburg', 234],
  ['Marburg-Biedenkopf', 195],

  ["Vogelsbergkreis", 72],
  ["Kreisfreie Stadt Kassel", 1877],
  ["Fulda", 162],
  ["Hersfeld-Rotenburg", 109],
  ["Kassel", 183],
  ["Schwalm-Eder-Kreis", 117],
  ["Landkreis Waldeck-Frankenberg", 85],
  ["Werra-Meißner-Kreis", 97],
  ["Kreisfreie Stadt Koblenz", 1080],
  ["Landkreis Ahrweiler", 163],
  ["Altenkirchen", 201],
  ["Bad Kreuznach", 185],
  ["Birkenfeld", 104],
  ["Cochem-Zell", 89],
  ["Mayen-Koblenz", 263],
  ["Neuwied", 294],
  ["Rhein-Hunsrück-Kreis", 105],
  ["Rhein-Lahn-Kreis", 157],
  ["Westerwaldkreis", 206],
  ["Trier", 945],
  ["Bernkastel-Wittlich", 97],
  ["Eifelkreis Bitburg-Prüm", 62],
  ["Vulkaneifel", 67],
  ["Trier-Saarburg", 137],
  ["Kreisfreie Stadt Frankenthal", 1112],
  ["Kreisfreie Stadt Kaiserslautern", 711],
  ["Landau in der Pfalz", 566],
  ["Kreisfreie Stadt Ludwigshafen am Rhein", 2223],
  ["Mainz", 2226],
  ["Neustadt an der Weinstraße", 457],
  ["Kreisfreie Stadt Pirmasens", 653],
  ["Kreisfreie Stadt Speyer", 1184],
  ["Worms", 771],
  ["Kreisfreie Stadt Zweibrücken", 483],
  ["Landkreis Alzey-Worms", 223],
  ["Landkreis Bad Dürkheim", 224],
  ["Donnersbergkreis", 117],
  ["Landkreis Germersheim", 279],
  ["Kaiserslautern", 167],
  ["Kusel", 122],
  ["Südliche Weinstraße", 174],
  ["Rhein-Pfalz-Kreis", 508],
  ["Mainz-Bingen", 351],


["Südwestpfalz", 99],
  ["Stuttgart", 3021],
  ["Böblingen", 636],
  ["Esslingen", 832],
  ["Göppingen", 403],
  ["Ludwigsburg", 793],
  ["Rems-Murr-Kreis", 498],
  ["Kreisfreie Stadt Heilbronn", 1258],
  ["Landkreis Heilbronn", 316],
  ["Hohenlohekreis", 146],
  ["Schwäbisch Hall", 134],
  ["Main-Tauber-Kreis", 102],
  ["Heidenheim", 212],
  ["Ostalbkreis", 208],
  ["Kreisfreie Stadt Baden-Baden", 396],
  ["Kreisfreie Stadt Karlsruhe", 1767],
  ["Karlsruhe", 413],
  ["Rastatt", 315],
  ["Heidelberg", 1463],
  ["Kreisfreie Stadt Mannheim", 2151],
  ["Neckar-Odenwald-Kreis", 128],
  ["Rhein-Neckar-Kreis", 517],
  ["Pforzheim", 1281],
  ["Calw", 202],
  ["Enzkreis", 349],
  ["Landkreis Freudenstadt", 137],
  ["Kreisfreie Stadt Freiburg im Breisgau", 1515],
  ["Breisgau-Hochschwarzwald", 193],
  ["Emmendingen", 247],
  ["Ortenaukreis", 234],
  ["Rottweil", 183],
  ["Schwarzwald-Baar-Kreis", 208],
  ["Landkreis Tuttlingen", 194],
  ["Konstanz", 352],
  ["Lörrach", 284],
  ["Waldshut", 151],
  ["Reutlingen", 264],
  ["Tübingen", 443],


["Zollernalbkreis", 208],
  ["Kreisfreie Stadt Ulm", 1070],
  ["Alb-Donau-Kreis", 147],
  ["Biberach", 144],
  ["Bodenseekreis", 329],
  ["Ravensburg", 176],
  ["Sigmaringen", 109],
  ["Kreisfreie Stadt Ingolstadt", 1035],
  ["Kreisfreie Stadt München", 4788],
  ["Kreisfreie Stadt Rosenheim", 1706],
  ["Altötting", 197],
  ["Berchtesgadener Land", 127],
  ["Landkreis Bad Tölz-Wolfratshausen", 115],
  ["Dachau", 268],
  ["Ebersberg", 263],
  ["Eichstätt", 110],
  ["Erding", 160],
  ["Freising", 226],
  ["Fürstenfeldbruck", 503],
  ["Garmisch-Partenkirchen", 87],
  ["Landsberg am Lech", 151],
  ["Miesbach", 115],
  ["Mühldorf a. Inn", 146],
  ["München", 527],
  ["Neuburg-Schrobenhausen", 133],
  ["Pfaffenhofen a.d.Ilm", 171],
  ["Rosenheim", 183],
  ["Landkreis Starnberg", 280],
  ["Traunstein", 116],
  ["Weilheim-Schongau", 141],
  ["Kreisfreie Stadt Landshut", 1111],
  ["Kreisfreie Stadt Passau", 763],
  ["Straubing", 708],
  ["Deggendorf", 140],
  ["Freyung-Grafenau", 80],
  ["Kelheim", 116],
  ["Landshut", 120],
  ["Passau", 127],
  ["Regen", 79],
  ["Rottal-Inn", 95],
  ["Straubing-Bogen", 85],
  ["Dingolfing-Landau", 112],
  ["Kreisfreie Stadt Amberg", 838],
  ["Kreisfreie Stadt Regensburg", 1899],
  ["Weiden i.d. OPf.", 602],
  ["Amberg-Sulzbach", 82],
  ["Cham", 84],
  ["Neumarkt in der Oberpfalz", 101],
  ["Neustadt a.d.Waldnaab", 66],
  ["Regensburg", 140],
  ["Schwandorf", 102],
  ["Tirschenreuth", 66],


["Kreisfreie Stadt Bamberg", 1423],
  ["Kreisfreie Stadt Bayreuth", 1105],
  ["Kreisfreie Stadt Coburg", 848],
  ["Kreisfreie Stadt Hof", 778],
  ["Bamberg", 126],
  ["Bayreuth", 81],
  ["Coburg", 147],
  ["Forchheim", 182],
  ["Hof", 105],
  ["Kronach", 101],
  ["Kulmbach", 108],
  ["Lichtenfels", 128],
  ["Wunsiedel", 118],
  ["Kreisfreie Stadt Ansbach", 417],
  ["Kreisfreie Stadt Erlangen", 1472],
  ["Kreisfreie Stadt Fürth", 2038],
  ["Nürnberg", 2739],
  ["Kreisfreie Stadt Schwabach", 1008],
  ["Landkreis Ansbach", 94],
  ["Erlangen-Höchstadt", 247],
  ["Fürth", 388],
  ["Landkreis Nürnberger Land", 214],
  ["Landkreis Neustadt a.d.Aisch-Bad Windsheim", 80],
  ["Roth", 142],
  ["Weißenburg-Gunzenhausen", 98],
  ["Kreisfreie Stadt Aschaffenburg", 1143],
  ["Kreisfreie Stadt Schweinfurt", 1501],
  ["Kreisfreie Stadt Würzburg", 1449],
  ["Aschaffenburg", 250],
  ["Bad Kissingen", 91],
  ["Rhön-Grabfeld", 78],
  ["Haßberge", 88],
  ["Landkreis Kitzingen", 134],
  ["Miltenberg", 180],
  ["Main-Spessart", 95],
  ["Schweinfurt", 138],
  ["Würzburg", 169],
  ["Kreisfreie Stadt Augsburg", 2019],
  ["Kaufbeuren", 1127],
  ["Kempten", 1091],
  ["Memmingen", 638],
  ["Aichach-Friedberg", 174],
  ["Augsburg", 241],
  ["Dillingen a.d. Donau", 124],
  ["Günzburg", 168],
  ["Neu-Ulm", 344],
  ["Lindau", 255],
  ["Ostallgäu", 103],
  ["Landkreis Unterallgäu", 120],
  ["Donau-Ries", 106],
  ["Oberallgäu", 103],
  ["Regionalverband Saarbrücken", 796],
  ["Merzig-Wadern", 186],
  ["Neunkirchen", 524],
  ["Landkreis Saarlouis", 422],
  ["Saarpfalz-Kreis", 337],
  ["Landkreis St. Wendel", 181],
  ["Kreisfreie Stadt Berlin", 4127],
  ["Brandenburg an der Havel", 315],
  ["Kreisfreie Stadt Cottbus", 594],
  ["Frankfurt", 383],
  ["Potsdam", 973],


 ["Barnim", 128],
  ["Landkreis Dahme-Spreewald", 77],
  ["Elbe-Elster", 53],
  ["Havelland", 96],
  ["Märkisch-Oderland", 92],
  ["Oberhavel", 119],
  ["Oberspreewald-Lausitz", 88],
  ["Oder-Spree", 79],
  ["Ostprignitz-Ruppin", 39],
  ["Potsdam-Mittelmark", 85],
  ["Prignitz", 35],
  ["Spree-Neiße", 68],
  ["Teltow-Fläming", 82],
  ["Uckermark", 38],
  ["Kreisfreie Stadt Rostock", 1149],
  ["Schwerin", 734],
  ["Mecklenburgische Seenplatte", 47],
  ["Rostock", 63],
  ["Vorpommern-Rügen", 70],
  ["Nordwestmecklenburg", 74],
  ["Landkreis Vorpommern-Greifswald", 60],
  ["Ludwigslust-Parchim", 44],
  ["Chemnitz", 1100],
  ["Erzgebirgskreis", 180],
  ["Mittelsachsen", 141],
  ["Vogtlandkreis", 157],
  ["Zwickau", 326],
  ["Dresden", 1691],
  ["Bautzen", 124],
  ["Görlitz", 118],
  ["Meißen", 165],
  ["Sächsische Schweiz-Osterzgebirge",148],


 ['Kreisfreie Stadt Leipzig', 2021],
  ['Leipzig', 156],
  ['Nordsachsen', 97],
  ['Kreisfreie Stadt Dessau-Roßlau', 321],
  ['Kreisfreie Stadt Halle', 1763],
  ['Kreisfreie Stadt Magdeburg', 1175],
  ['Altmarkkreis Salzwedel', 36],
  ['Landkreis Anhalt-Bitterfeld', 107],
  ['Börde', 72],
  ['Burgenlandkreis', 125],
  ['Harz', 99],
  ['Jerichower Land', 56],
  ['Landkreis Mansfeld-Südharz', 91],
  ['Saalekreis', 127],
  ['Salzlandkreis', 130],
  ['Stendal', 45],
  ['Wittenberg', 64],
  ['Kreisfreie Stadt Erfurt', 790],
  ['Kreisfreie Stadt Gera', 600],
  ['Kreisfreie Stadt Jena', 963],
  ['Suhl', 255],
  ['Kreisfreie Stadt Weimar', 771],
  ['Eichsfeld', 105],
  ['Nordhausen', 114],
  ['Wartburgkreis', 116],
  ['Unstrut-Hainich-Kreis', 103],
  ['Kyffhäuserkreis', 70],
  ['Schmalkalden-Meiningen', 99],
  ['Gotha', 143],
  ['Sömmerda', 85],
  ['Hildburghausen', 66],
  ['Ilm-Kreis', 131],
  ['Weimarer Land', 102],
  ['Landkreis Sonneberg', 123],
  ['Landkreis Saalfeld-Rudolstadt', 100],
  ['Saale-Holzland-Kreis', 101],
  ['Saale-Orla-Kreis', 69],
  ['Greiz', 114],
  ['Altenburger Land', 154],
    
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
  //   if(regierungsbezirkCount > 1000){
  //     return 'rgba(255, 0, 0, 0.9)';
  //   }else if (regierungsbezirkCount > 750) {
  //     return 'rgba(255, 0, 0, 0.7)'; 
  //   }else if(regierungsbezirkCount > 500){
  //     return 'rgba(255, 0, 0, 0.5)'; 
  //   }
  //    else if (regierungsbezirkCount > 250) {
  //     return 'rgba(255, 0, 0, 0.3)';
  //   } else {
  //     return 'rgba(255, 0, 0, 0.1)'
  //   }
  // }

  // private getFillColorKreise(kreiseCount:number):string{
  //   if(kreiseCount > 150){
  //     return 'rgba(255, 0, 0, 0.9)';
  //   } else if (kreiseCount > 100) {
  //     return 'rgba(255, 0, 0, 0.7)'; 
  //   } else if (kreiseCount > 50) {
  //     return 'rgba(255, 0, 0, 0.5)'; 
  //   } else if (kreiseCount> 25) {
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
  const BOM = '\uFEFF';
  const header = [headerLabel, 'Ladeleistung je Einwohner/km^2'];
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






  



