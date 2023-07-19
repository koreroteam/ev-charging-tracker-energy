import { HttpResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import * as L from 'leaflet';
import 'leaflet.markercluster'
import { SmartLabService } from '../../service/evp/smartlabs.service';
import { CountryOrdersMapService } from '../e-commerce/country-orders/map/country-orders-map.service';
import { map, catchError } from 'rxjs/operators';
import * as htmlToImage from 'html-to-image';

@Component({
  selector: 'ngx-charging-infra-point-map',
  templateUrl: './charging-infra-point-map.component.html',
  styleUrls: ['./charging-infra-point-map.component.scss']
})
export class ChargingInfraPointMapComponent implements OnInit, AfterViewInit {

  private map;
  availableStations: any;
  markers: Number[][] = [];
  currentTheme: any;

  private async initMap(): Promise<void> {

    await (await this.apiService.getChargePointCordinates())
      .subscribe(data => {
        this.availableStations = data; 
        console.log(data.length)       
        var markerCluster = L.markerClusterGroup({
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true
        });
        for (let cords of data) {
          
          var lat = Number(cords.lat.replace(',', '.'));
          var lon = Number(cords.lon.replace(',', '.'));
          
          var marker = L.marker([lat, lon], { icon: this.iconHtmlGenerator() }).bindPopup('<b> <i class="fa fa-solid fa-charging-station text-danger"></i> ' + cords.evse_id + '</br>');
          markerCluster.addLayer(marker);
          marker.on('mouseover', function (e) {
            this.openPopup();
          });
          marker.on('mouseout', function (e) {
            this.closePopup();
          });
        }
        this.map.addLayer(markerCluster);
      });


    this.map = L.map('leafLetMap', {
      center: [51.5200, 9.4050],
      zoom: 6
    });
    const warningMaper = L.divIcon({
      html: '<i class="fa fa-solid fa-circle fa-1x text-warning"></i>',
      className: 'myDivIcon'
    });
    const dangerMaper = L.divIcon({
      html: '<i class="fa fa-solid fa-circle fa-1x text-danger"></i>',
      className: 'myDivIcon'
    });
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
    });
    tiles.addTo(this.map);
    //L.marker([52.53164, 13.51704], { icon: warningMaper }).addTo(this.map);

    this.ecMapService.getGermanCords()
      .subscribe(data => {
        L.geoJSON(
          data as any,
          {
            style: () => ({
              "color": "black",
              "weight": 1,
              "opacity": 1,
              fillOpacity: 0,
            })
          }).addTo(this.map);
      });

    // this.ecMapService.getGermanStateLatLon().subscribe(data => {
    //   var markerCluster = L.markerClusterGroup({
    //     spiderfyOnMaxZoom: false,
    //     showCoverageOnHover: false,
    //     zoomToBoundsOnClick: false
    //   });
    //   for (let cords of data) {
    //     var marker = L.marker([Number(cords.lat), Number(cords.lng)], { icon: this.iconHtmlGenerator() }).bindPopup('<b> <i class="fa fa-solid fa-charging-station text-danger"></i>  ' + cords.city + '</b>');
    //     markerCluster.addLayer(marker);
    //     marker.on('mouseover', function (e) {
    //       this.openPopup();
    //     });
    //     marker.on('mouseout', function (e) {
    //       this.closePopup();
    //     });
    //   }
    //   this.map.addLayer(markerCluster);
    // });
  }

  renderPositions(availableStations: any) {
    availableStations.forEach(element => {
      const marker: Number[] = [];
      marker.push(Number(element.chargePointLocation.lat));
      marker.push(Number(element.chargePointLocation.lon));
      this.markers.push(marker);
      console.log(marker);
    });
    console.log(this.markers)
  }

  constructor(private apiService: SmartLabService, private theme: NbThemeService, private ecMapService: CountryOrdersMapService) { }

  iconHtmlGenerator() {
    return L.divIcon({
      html: '<img src="assets/images/map-marker.svg" width="50px" height="50px">',
      className: 'myDivIcon'
    });
  }

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

  ngAfterViewInit(): void {
    this.initMap();
  }

  getRandomColor() {
    let colors = ['#C20000', '#E2463E', '#FF7F7F', '#FFB3B4', '#FFE5E5', '#C20000', '#C20000']; // add your color codes
    return colors[Math.floor(Math.random() * colors.length)];
  }

  ngOnInit(): void {
  }

  async getReport() {
    (await this.apiService.exportCSVReport(0)).pipe(
      map((response: HttpResponse<Blob>) => {
        console.log(response.headers.keys());
        return response.body;
      }))
        .subscribe((response) => {          
          var downloadURL = window.URL.createObjectURL(response);
          var link = document.createElement('a');
          link.href = downloadURL;
          link.download = "Report.xlsx";
          link.click();
        });
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

}
