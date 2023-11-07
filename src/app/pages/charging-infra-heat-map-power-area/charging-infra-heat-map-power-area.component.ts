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
  selector: 'ngx-charging-infra-heat-map-power-area',
  templateUrl: './charging-infra-heat-map-power-area.component.html',
  styleUrls: ['./charging-infra-heat-map-power-area.component.scss']
})
export class ChargingInfraHeatMapPowerAreaComponent implements OnInit, AfterViewInit {
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
    document.getElementById('PowerArea').style.backgroundColor = "rgba(85,90,96,0.3)";
    this.map = L.map('PowerArea', {
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
    const areaSize = this.DISTRICT_SIZES_Kreise.get(name) ?? 1;
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
            const areaSize = this.DISTRICT_SIZES_Kreise.get(kreiseName) ?? 1;
            const chargePointDensity = chargePointPower / areaSize; 
          
            
           
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

            const areaSize = this.DISTRICT_SIZES_Kreise.get(kreiseName) ?? 1;
            const chargePointDensity = (chargePointPower / areaSize).toFixed(2); 
            this.popupDataKreise.push([kreiseName, chargePointDensity]);

             const popupContent = `Landkreis: ${kreiseName}<br>Installierte Leistung je km²: ${chargePointDensity} kWh`;
           
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
          .filter(([name]) => this.DISTRICT_SIZES.has(name))
          .map(([name, count]) => {
              const areaSize = this.DISTRICT_SIZES.get(name) ?? 1;
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
            const areaSize = this.DISTRICT_SIZES.get(name) ?? 1;
            const chargePointDensity = (power / areaSize); 
            
           
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
           
            const areaSize = this.DISTRICT_SIZES.get(name) ?? 1;
            const chargePointDensity = (power / areaSize).toFixed(2); 
            this.popupDataRegierungsbezirk.push([name, chargePointDensity]);
  
            const popupContent = `Regierungsbezirk: ${name}<br>Installierte Leistung je km²: ${chargePointDensity} kWh`;
            


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

  private DISTRICT_SIZES_Kreise: Map<string, number> = new Map([
    
   
    ["Flensburg", 56.73],
    ["Kiel", 118.65],
    ["Kreisfreie Stadt Lübeck", 214.19],
    ["Kreisfreie Stadt Neumünster",	71.66],
    ["Dithmarschen", 1428.17],
   ["Herzogtum Lauenburg", 1263.06],
   ["Nordfriesland", 2083.56],
   ["Ostholstein", 1393.02],
   ["Pinneberg", 664.25],
   ["Kreis Plön", 1083.56],
   ["Kreis Rendsburg-Eckernförde", 2189.79],
   ["Schleswig-Flensburg", 2071.28],
   ["Segeberg", 1344.47],
   ["Steinburg", 1055.7],
   ["Stormarn", 766.22],
   ["Hamburg", 755.09],
   ["Kreisfreie Stadt Braunschweig", 192.7],
   ["Kreisfreie Stadt Salzgitter", 224.49],
   ["Kreisfreie Stadt Wolfsburg", 204.62],
   ["Gifhorn", 1567.57],
   ["Landkreis Goslar", 966.71],
   ["Helmstedt", 676.13],
   ["Northeim", 1268.77],
   ["Landkreis Peine", 536.5],
   ["Wolfenbüttel", 724.32],
   ["Göttingen", 1755.41],
   ["Region Hannover", 2297.13],
   ["Landkreis Diepholz", 1991],
   ["Hameln-Pyrmont", 797.54],
   ["Landkreis Hildesheim", 1208.34],
   ["Holzminden", 694.27],
   ["Landkreis Nienburg/Weser", 1400.83],
   ["Schaumburg", 675.67],
   ["Celle", 1550.83],
   ["Cuxhaven", 2058.96],
 
 
 ["Landkreis Harburg", 1248.45],
   ["Lüchow-Dannenberg", 1227.32],
   ["Lüneburg", 1327.8],
   ["Osterholz", 652.67],
   ["Rotenburg (Wümme)", 2074.77],
   ["Landkreis Heidekreis", 1881.46],
   ["Landkreis Stade", 1267.38],
   ["Uelzen", 1462.6],
   ["Verden", 789.33],
   ["Delmenhorst", 62.45],
   ["Emden", 112.34],
   ["Kreisfreie Stadt Oldenburg", 103.09],
   ["Kreisfreie Stadt Osnabrück", 119.8],
   ["Wilhelmshaven", 107.11],
   ["Ammerland", 730.65],
   ["Aurich", 1287.35],
   ["Landkreis Cloppenburg", 1420.34],
   ["Emsland", 2883.67],
   ["Friesland", 609.53],
   ["Grafschaft Bentheim", 981.79],
   ["Leer (Ostfriesland)", 1085.72],
   ["Oldenburg", 1064.82],
   ["Osnabrück", 2121.81],
   ["Vechta", 814.21],
   ["Wesermarsch", 824.78],
   ["Wittmund", 656.86],
   ["Bremen", 317.84],
   ["Bremerhaven", 101.53],
   ["Düsseldorf", 217.41],
   ["Duisburg", 232.79],
   ["Essen", 210.34],
   ["Krefeld", 137.78],
   ["Mönchengladbach", 170.47],
   ["Kreisfreie Stadt Mülheim an der Ruhr", 91.28],
   ["Kreisfreie Stadt Oberhausen", 77.09],
   ["Kreisfreie Stadt Remscheid", 74.52],
   ["Kreisfreie Stadt Solingen", 89.54],
   ["Kreisfreie Stadt Wuppertal", 168.39],
   ["Kreis Kleve", 1232.99],
   ["Mettmann", 407.22],
   ["Rhein-Kreis Neuss", 576.44],
   ["Kreis Viersen", 563.28],
   ["Wesel", 1042.8],
   ["Bonn", 141.06],
 
 
 
   ["Kreisfreie Stadt Köln", 405.01],
   ["Kreisfreie Stadt Leverkusen", 78.87],
   ["Aachen", 706.91],
   ["Düren", 941.49],
   ["Rhein-Erft-Kreis", 704.71],
   ["Kreis Euskirchen", 1248.73],
   ["Heinsberg", 627.91],
   ["Oberbergischer Kreis", 918.85],
   ["Rheinisch-Bergischer Kreis", 437.33],
   ["Rhein-Sieg-Kreis", 1153.21],
   ["Kreisfreie Stadt Bottrop", 100.62],
   ["Kreisfreie Stadt Gelsenkirchen", 104.94],
   ["Kreisfreie Stadt Münster", 303.28],
   ["Borken", 1420.98],
   ["Coesfeld", 1112.04],
   ["Recklinghausen", 761.48],
   ["Steinfurt", 1795.75],
   ["Warendorf", 1319.42],
   ["Kreisfreie Stadt Bielefeld", 258.83],
   ["Gütersloh", 969.21],
   ["Herford", 450.39],
   ["Höxter", 1201.42],
   ["Lippe", 1246.21],
   ["Minden-Lübbecke", 1152.42],
   ["Kreis Paderborn", 1246.8],
   ["Bochum", 145.66],
   ["Dortmund", 280.71],
   ["Hagen", 160.45],
   ["Hamm", 226.42],
   ["Kreisfreie Stadt Herne", 51.42],
   ["Ennepe-Ruhr-Kreis", 409.64],
   ["Hochsauerlandkreis", 1960.17],
   ["Märkischer Kreis", 1061.09],
   ["Olpe", 712.11],
   ["Siegen-Wittgenstein", 1132.89],
   ["Soest", 1328.63],
   ["Unna", 543.21],
   ["Kreisfreie Stadt Darmstadt", 122.07],
   ["Kreisfreie Stadt Frankfurt am Main", 248.31],
   ["Kreisfreie Stadt Offenbach am Main", 44.88],
   ["Kreisfreie Stadt Wiesbaden", 203.87],
   ["Kreis Bergstraße", 719.47],
   ["Darmstadt-Dieburg", 658.64],
   ["Groß-Gerau", 453.03],
   ["Hochtaunuskreis", 481.84],
   ["Main-Kinzig-Kreis", 1397.32],
   ["Main-Taunus-Kreis", 222.53],
   ["Odenwaldkreis", 623.97],
   ["Offenbach", 356.24],
   ["Rheingau-Taunus-Kreis", 811.41],
   ["Wetteraukreis", 1100.66],
 
 
  ["Landkreis Gießen", 854.56],
   ["Lahn-Dill-Kreis", 1066.3],
   ["Limburg-Weilburg", 738.44],
   ["Marburg-Biedenkopf", 1262.37],
   ["Vogelsbergkreis", 1458.91],
   ["Kreisfreie Stadt Kassel", 106.79],
   ["Fulda", 1380.41],
   ["Hersfeld-Rotenburg", 1097.75],
   ["Kassel", 1293.31],
   ["Schwalm-Eder-Kreis", 1539.01],
   ["Landkreis Waldeck-Frankenberg", 1848.7],
   ["Werra-Meißner-Kreis", 1024.83],
   ["Kreisfreie Stadt Koblenz", 105.25],
   ["Landkreis Ahrweiler", 787.03],
   ["Altenkirchen", 642.38],
   ["Bad Kreuznach", 863.89],
   ["Birkenfeld", 776.83],
   ["Cochem-Zell", 692.43],
   ["Mayen-Koblenz", 817.73],
   ["Neuwied", 627.06],
   ["Rhein-Hunsrück-Kreis", 991.06],
 
 
  ["Rhein-Lahn-Kreis", 782.24],
     ["Westerwaldkreis", 989.04],
     ["Trier", 117.06],
     ["Bernkastel-Wittlich", 1167.92],
     ["Eifelkreis Bitburg-Prüm", 1626.95],
     ["Vulkaneifel", 911.64],
     ["Trier-Saarburg", 1102.26],
     ["Kreisfreie Stadt Frankenthal", 43.88],
     ["Kreisfreie Stadt Kaiserslautern", 139.7],
     ["Landau in der Pfalz", 82.94],
     ["Kreisfreie Stadt Ludwigshafen am Rhein", 77.43],
     ["Mainz", 97.73],
     ["Neustadt an der Weinstraße", 117.09],
     ["Kreisfreie Stadt Pirmasens", 61.35],
     ["Kreisfreie Stadt Speyer", 42.71],
     ["Worms", 108.73],
     ["Kreisfreie Stadt Zweibrücken", 70.64],
     ["Landkreis Alzey-Worms", 588.07],
     ["Landkreis Bad Dürkheim", 594.64],
     ["Donnersbergkreis", 645.41],
     ["Landkreis Germersheim", 463.32],
     ["Kaiserslautern", 640],
     ["Kusel", 573.61],
     ["Südliche Weinstraße", 639.93],
     ["Rhein-Pfalz-Kreis", 304.99],
     ["Mainz-Bingen", 605.33],
     ["Südwestpfalz", 953.53],
     ["Stuttgart", 207.33],
     ["Böblingen", 617.76],
     ["Esslingen", 641.28],
     ["Göppingen", 642.34],
     ["Ludwigsburg", 686.77],
     ["Rems-Murr-Kreis", 858.08],
     ["Kreisfreie Stadt Heilbronn", 99.89],
     ["Landkreis Heilbronn", 1099.91],
     ["Hohenlohekreis", 776.76],
     ["Schwäbisch Hall", 1484.07],
     ["Main-Tauber-Kreis", 1304.12],
     ["Heidenheim", 627.14],
     ["Ostalbkreis", 1511.39],
     ["Kreisfreie Stadt Baden-Baden", 140.19],
     ["Kreisfreie Stadt Karlsruhe", 173.42],
     ["Karlsruhe", 1084.98],
     ["Rastatt", 738.43],
     ["Heidelberg", 108.83],
     ["Kreisfreie Stadt Mannheim", 144.97],
     ["Neckar-Odenwald-Kreis", 1125.95],
     ["Rhein-Neckar-Kreis", 1061.55],
     ["Pforzheim", 97.99],
     ["Calw", 797.29],
 
 
 ["Enzkreis", 573.6],
   ["Landkreis Freudenstadt", 870.4],
   ["Kreisfreie Stadt Freiburg im Breisgau", 153.04],
   ["Breisgau-Hochschwarzwald", 1378.32],
   ["Emmendingen", 679.8],
   ["Ortenaukreis", 1860.29],
   ["Rottweil", 769.42],
   ["Schwarzwald-Baar-Kreis", 1025.34],
   ["Landkreis Tuttlingen", 734.38],
   ["Konstanz", 817.98],
   ["Lörrach", 806.66],
   ["Waldshut", 1131.15],
   ["Reutlingen", 1092.48],
   ["Tübingen", 519.11],
   ["Zollernalbkreis", 917.58],
   ["Kreisfreie Stadt Ulm", 118.68],
 
 
  ['Alb-Donau-Kreis', 1358.55],
     ['Biberach', 1409.53],
     ['Bodenseekreis', 664.77],
     ['Ravensburg', 1632.08],
     ['Sigmaringen', 1204.23],
     ['Kreisfreie Stadt Ingolstadt', 133.35],
     ['Kreisfreie Stadt München', 310.7],
     ['Kreisfreie Stadt Rosenheim', 37.22],
     ['Altötting', 569.28],
     ['Berchtesgadener Land', 839.82],
     ['Landkreis Bad Tölz-Wolfratshausen', 1110.67],
     ['Dachau', 579.16],
     ['Ebersberg', 549.39],
     ['Eichstätt', 1213.85],
     ['Erding', 870.74],
     ['Freising', 799.85],
     ['Fürstenfeldbruck', 434.8],
     ['Garmisch-Partenkirchen', 1012.17],
     ['Landsberg am Lech', 804.36],
     ['Miesbach', 866.21],
     ['Mühldorf a. Inn', 805.33],
     ['München', 664.25],
     ['Neuburg-Schrobenhausen', 739.71],
     ['Pfaffenhofen a.d.Ilm', 761.05],
     ['Rosenheim', 1439.44],
     ['Landkreis Starnberg', 487.71],
     ['Traunstein', 1533.76],
     ['Weilheim-Schongau', 966.28],
     ['Kreisfreie Stadt Landshut', 65.83],
     ['Kreisfreie Stadt Passau', 69.56],
     ['Straubing', 67.59],
     ['Deggendorf', 861.17],
     ['Freyung-Grafenau', 983.85],
     ['Kelheim', 1065.13],
     ['Landshut', 1347.55],
     ['Passau', 1530.09],
     ['Regen', 974.78],
     ['Rottal-Inn', 1281.2],
     ['Straubing-Bogen', 1201.61],
     ['Dingolfing-Landau', 877.58],
     ['Kreisfreie Stadt Amberg', 50.13],
     ['Kreisfreie Stadt Regensburg', 80.86],
     ['Weiden i.d. OPf.', 70.57],
     ['Amberg-Sulzbach', 1255.86],
     ['Cham', 1526.82],
 
 
  ["Neumarkt in der Oberpfalz", 1343.96],
   ["Neustadt a.d.Waldnaab", 1427.69],
   ["Regensburg", 1391.65],
   ["Schwandorf", 1458.34],
   ["Tirschenreuth", 1084.25],
   ["Kreisfreie Stadt Bamberg", 54.62],
   ["Kreisfreie Stadt Bayreuth", 66.89],
   ["Kreisfreie Stadt Coburg", 48.29],
   ["Kreisfreie Stadt Hof", 58.02],
   ["Bamberg", 1167.79],
   ["Bayreuth", 1273.62],
   ["Coburg", 590.42],
   ["Forchheim", 642.82],
   ["Hof", 892.52],
   ["Kronach", 651.49],
   ["Kulmbach", 658.33],
   ["Lichtenfels", 519.94],
   ["Wunsiedel", 606.37],
   ["Kreisfreie Stadt Ansbach", 99.91],
   ["Kreisfreie Stadt Erlangen", 76.96],
   ["Kreisfreie Stadt Fürth", 63.35],
   ["Nürnberg", 186.44],
   ["Kreisfreie Stadt Schwabach", 40.8],
   ["Landkreis Ansbach", 1971.32],
   ["Erlangen-Höchstadt", 564.55],
   ["Fürth", 307.44],
   ["Landkreis Nürnberger Land", 799.52],
   ["Landkreis Neustadt a.d.Aisch-Bad Windsheim", 1267.45],
   ["Roth", 895.16],
   ["Weißenburg-Gunzenhausen", 970.78],
   ["Kreisfreie Stadt Aschaffenburg", 62.45],
   ["Kreisfreie Stadt Schweinfurt", 35.7],
   ["Kreisfreie Stadt Würzburg", 87.6],
   ["Aschaffenburg", 698.9],
   ["Bad Kissingen", 1136.9],
   ["Rhön-Grabfeld", 1021.68],
   ["Haßberge", 956.19],
   ["Landkreis Kitzingen", 684.14],
   ["Miltenberg", 715.58],
   ["Main-Spessart", 1321.2],
   ["Schweinfurt", 841.39],
   ["Würzburg", 968.35],
   ["Kreisfreie Stadt Augsburg", 146.85],
   ["Kaufbeuren", 40.02],
   ["Kempten", 63.28],
   ["Memmingen", 70.11],
 
 
 
  ['Aichach-Friedberg', 780.23],
   ['Augsburg', 1070.63],
   ['Dillingen a.d. Donau', 792.23],
   ['Günzburg', 762.4],
   ['Neu-Ulm', 515.84],
   ['Lindau', 323.39],
   ['Ostallgäu', 1394.43],
   ['Landkreis Unterallgäu', 1229.57],
   ['Donau-Ries', 1274.57],
   ['Oberallgäu', 1527.97],
   ['Regionalverband Saarbrücken', 410.95],
   ['Merzig-Wadern', 556.66],
   ['Neunkirchen', 249.8],
   ['Landkreis Saarlouis', 459.35],
   ['Saarpfalz-Kreis', 418.28],
   ['Landkreis St. Wendel', 476.48],
   ['Kreisfreie Stadt Berlin', 891.12],
   ['Brandenburg an der Havel', 229.72],
   ['Kreisfreie Stadt Cottbus', 165.62],
   ['Frankfurt', 147.85],
   ['Potsdam', 188.24],
   ['Barnim', 1479.58],
   ['Landkreis Dahme-Spreewald', 2274.5],
   ['Elbe-Elster', 1899.2],
   ['Havelland', 1727.31],
   ['Märkisch-Oderland', 2158.65],
   ['Oberhavel', 1808.19],
   ['Oberspreewald-Lausitz', 1223.48],
   ['Oder-Spree', 2256.75],
   ['Ostprignitz-Ruppin', 2526.5],
   ['Potsdam-Mittelmark', 2592.02],
   ['Prignitz', 2138.54],
   ['Spree-Neiße', 1656.99],
   ['Teltow-Fläming', 2104.2],
   ['Uckermark', 3077.03],
   ['Kreisfreie Stadt Rostock', 181.36],
   ['Schwerin', 130.52],
   ['Mecklenburgische Seenplatte', 5495.58],
   ['Rostock', 3431.2],
   ['Vorpommern-Rügen', 3215.69],
   ['Nordwestmecklenburg', 2127.07],
   ['Landkreis Vorpommern-Greifswald', 3945.66],
   ['Ludwigslust-Parchim', 4766.81],
   ['Chemnitz', 221.03],
   ['Erzgebirgskreis', 1827.93],
   ['Mittelsachsen', 2116.85],
   ['Vogtlandkreis', 1412.41],
   ['Zwickau', 949.78],
   ['Dresden', 328.49],
   ['Bautzen', 2395.59],
   ['Görlitz', 2111.41],
   ['Meißen', 1454.59],
 
 
 
 
  ['Sächsische Schweiz-Osterzgebirge', 1654.2],
   ['Kreisfreie Stadt Leipzig', 297.8],
   ['Leipzig', 1651.26],
   ['Nordsachsen', 2028.56],
   ['Kreisfreie Stadt Dessau-Roßlau', 245],
   ['Kreisfreie Stadt Halle', 135.01],
   ['Kreisfreie Stadt Magdeburg', 201.03],
   ['Altmarkkreis Salzwedel', 2294.59],
   ['Landkreis Anhalt-Bitterfeld', 1455.08],
   ['Börde', 2367.22],
   ['Burgenlandkreis', 1414.04],
   ['Harz', 2104.92],
   ['Jerichower Land', 1578.19],
   ['Landkreis Mansfeld-Südharz', 1449.05],
   ['Saalekreis', 1434.23],
   ['Salzlandkreis', 1428.11],
   ['Stendal', 2424.25],
   ['Wittenberg', 1933.32],
   ['Kreisfreie Stadt Erfurt', 269.91],
   ['Kreisfreie Stadt Gera', 152.18],
   ['Kreisfreie Stadt Jena', 114.77],
   ['Suhl', 141.62],
   ['Kreisfreie Stadt Weimar', 84.48],
   ['Eichsfeld', 943.07],
   ['Nordhausen', 713.93],
   ['Wartburgkreis', 1371.14],
   ['Unstrut-Hainich-Kreis', 979.68],
   ['Kyffhäuserkreis', 1037.91],
   ['Schmalkalden-Meiningen', 1251.21],
   ['Gotha', 936.08],
 
   ["Sömmerda", 806.86],
     ["Hildburghausen", 938.42],
     ["Ilm-Kreis", 805.11],
     ["Weimarer Land", 804.48],
     ["Landkreis Sonneberg", 460.85],
     ["Landkreis Saalfeld-Rudolstadt", 1008.78],
     ["Saale-Holzland-Kreis", 815.24],
     ["Saale-Orla-Kreis", 1151.3],
     ["Greiz", 845.98],
     ["Altenburger Land", 569.39],
 
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
  //   if(regierungsbezirkCount > 20){
  //     return 'rgba(255, 0, 0, 0.9)';
  //   }else if (regierungsbezirkCount > 15) {
  //     return 'rgba(255, 0, 0, 0.7)'; 
  //   }else if(regierungsbezirkCount > 10){
  //     return 'rgba(255, 0, 0, 0.5)'; 
  //   }
  //    else if (regierungsbezirkCount > 5) {
  //     return 'rgba(255, 0, 0, 0.3)';
  //   } else {
  //     return 'rgba(255, 0, 0, 0.1)'
  //   }
  // }

  // private getFillColorKreise(kreiseCount:number):string{
  //   if(kreiseCount > 100){
  //     return 'rgba(255, 0, 0, 0.9)';
  //   } else if (kreiseCount > 50) {
  //     return 'rgba(255, 0, 0, 0.7)'; 
  //   } else if (kreiseCount > 25) {
  //     return 'rgba(255, 0, 0, 0.5)'; 
  //   } else if (kreiseCount> 5) {
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
  
  const header = [headerLabel, 'Ladeleistungen je km^2'];
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






  



