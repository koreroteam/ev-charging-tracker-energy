import { Component, OnInit } from '@angular/core';
import { SmartLabService } from '../../../service/evp/smartlabs.service'
@Component({
  selector: 'ngx-gmaps',
  styleUrls: ['./gmaps.component.scss'],
  templateUrl: './gmaps.component.html',
})
export class GmapsComponent implements OnInit {
  async ngOnInit(): Promise<void> {

    navigator.geolocation.getCurrentPosition((position) => {
      this.center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }
    }),

      (await this.apiService.getAvailableChargingStaions())
      .subscribe(data => {

        this.availableStations = data;
        this.renderPositions(this.availableStations);
        console.log(this.positions)
      });

    this.positionCenter.lat = Number(51);
    this.positionCenter.lng = Number(10);


    

  }
  constructor(private apiService: SmartLabService) {
  }

  positionCenter: Position = <Position>{};
  zoom = 5;
  center: google.maps.LatLngLiteral;
  options: google.maps.MapOptions = {
   // mapTypeId: 'roadmap'
  }

  optionsMaps: { animation: google.maps.Animation.BOUNCE }


  availableStations: any;


  positions: Position[] = <Position[]>[];
  readonly image = "assets/images/iconCharge.png";
  renderPositions(availableStations: any) {
    availableStations.forEach(element => {
      //console.log(element);
      let positionObj = <Position>{};
      positionObj.lat = Number(element.chargePointLocation.lat)
      positionObj.lng = Number(element.chargePointLocation.lon)
      this.positions.push(positionObj);
    });
  }
}

interface Position {
  lat: Number;
  lng: Number;
}
