import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { LocalDataSource } from 'ng2-smart-table';
import { map } from 'rxjs/operators';
import { SmartLabService } from '../../service/evp/smartlabs.service';
import { ChargingInfoDialogComponent } from '../charging-info-dialog/charging-info-dialog.component';
import { title } from 'process';


@Component({
  selector: 'ngx-charging-point-list',
  templateUrl: './charging-point-list.component.html',
  styleUrls: ['./charging-point-list.component.scss']
})

export class ChargingPointListComponent implements OnInit {

  constructor(private apiService: SmartLabService, private dialogService: NbDialogService) { }

  availableStations: any;
  selectedItem: any = 0;
  options = [];

  changeLocation(selected: [Number]): void {
    this.selectedItem = selected;
    this.getChargingStations();
  }

  settings = {
    actions: {
      delete: false,
      add: false,
      edit: false,
      custom: [
        {
          name: 'view',
          title: `<i class="nb-lightbulb inline-block width: 50px"></i>`,
        }]
    },
    columns: {
      evseID: {
        title: 'EvseID',
        type: 'string',
        // valuePrepareFunction: (value) => {
        //   return `<a href="/pages/charging-dynamic-stats?evseID=${value}">${value}</a>`;
        // },
      },
      // chargingStationID: {
      //   title: 'StationID',
      //   type: 'string',
      // },
      // operatorID: {
      //   title: 'OperatorID',
      //   type: 'string',
      // },
      operatorName: {
        title: 'Betreiber',
        type: 'string',
      },
      // source: {
      //   title: 'Quelle',
      //   type: 'string',
      // },
      chargePointType: {
        title: 'Leistungsklasse',
        type: 'string',
      },
      maximumPower: {
        title: 'Leistung',
        type: 'string',
      },
      address: {
        title: 'Addresse',
        type: 'string',
      },
     
      zipCode: {
        title: 'PLZ',
        type: 'string',
      },
      city: {
        title: 'Stadt',
        type: 'string',
      },
      latitude:{
        title:'Breitensgrad',
        type: 'string',
      },
      longitude: {
        title: 'Längengrad',
        type: 'string',
      },
      source:{
        title: 'Quelle',
        type: 'string',
      },
      chargingStationID:{
        title:'LadepunktID',
        type:'string',
      },
    },
  };

  source: LocalDataSource = new LocalDataSource();

  onCustom(event) {
    this.open(event.data);
  }

  ngOnInit(): void {
    this.getChargingCount();
  }
  ngAfterViewInit(): void {
    this.getChargingStations();
  }

  open(data: any) {
    this.dialogService.open(ChargingInfoDialogComponent, {
      context: {
        title: 'Details für Ladepunkt ' + data.evseID,
        data: data
      },
    });
  }

  async getChargingStations() {
    (await this.apiService.getAvailableChargingStations())
      .subscribe(data => {
        console.log(data)
        this.source.load(data);
      });
  }
  

  async getChargingCount() {
    (await this.apiService.getChargingStaionsCount())
      .subscribe(data => {
        console.log(data)
        this.options = Array.from(Array(data).keys());
      });
  }

  async getReport() {
    (await this.apiService.exportCSVReport(this.selectedItem)).pipe(
      map((response: HttpResponse<Blob>) => {
        console.log(response.headers.keys());
        return response.body;
      }))
      .subscribe((response) => {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        link.download = "ChargingStations.csv";
        link.click();
      });
  }
}
