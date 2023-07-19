import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { SmartLabService } from '../../service/evp/smartlabs.service';
import * as moment from 'moment';
import { HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Component({
  selector: 'ngx-charging-infro-dynamic',
  templateUrl: './charging-infro-dynamic.component.html',
  styleUrls: ['./charging-infro-dynamic.component.scss']
})
export class ChargingInfroDynamicComponent implements OnInit {

  constructor(private apiService: SmartLabService, private route: ActivatedRoute) { }

  historicData: any;
  evseId:any;
  timeData:any;
  moment:any;

  settings = {
    hideSubHeader: true,
    actions: {
      delete: false,
      add: false,
      edit: false
    },
    columns: {
      evseID: {
        title: 'EvseID',
        type: 'html',
        valuePrepareFunction : (value) => {
          return `<a href="/pages/charging-dynamic-stats?evseID=${value}">${value}</a>`;
        },
      },
      createdAt: {
        title: 'Datum & Zeit',
        type: 'string',
        valuePrepareFunction : (value) => {
          return moment(value).format('MMM Do, h:mm a');
        },
        sortDirection: 'desc'
      },
      evseStatus: {
        title: 'Status',
        type: 'html',
        // valuePrepareFunction : (value) => {
        //   return `<button disabled nbButton>disabled</button>`;
        // }
      }
    },
  };

  source: LocalDataSource = new LocalDataSource();

  async ngOnInit() {
    // this.route.queryParams
    //   .subscribe(params => {
    //     this.evseId=params.evseID;
    //   }
    //   );

    //   (await this.apiService.getHistoricalChargingDynamic())
    //   .subscribe(data => {
    //     this.historicData = data;
    //     this.source.load(data);
    //   });

      (await this.apiService.getHistoricalChargingDynamic())
      .subscribe(data => {

        this.historicData = data;
        this.timeData = moment(this.historicData[0].createdAt).format('MMM Do, h:mm a');
        this.source.load(data);
      });

  }


  // getChargingList() {
  //   (await this.apiService.getAvailableChargingDynamic('DEWUEE000201'))
  //     .subscribe(data => {
  //       this.historicData = data;
  //       this.source.load(data);
  //     });
  // }

  async getReport(){
    (await this.apiService.exportHistoricalCSVReport()).pipe(
      map((response: HttpResponse<Blob>) => {
        console.log(response.headers.keys());
        return response.body;
      }))
        .subscribe((response) => {          
          var downloadURL = window.URL.createObjectURL(response);
          var link = document.createElement('a');
          link.href = downloadURL;
          link.download = "ChargingStationsDynamicStatus.xlsx";
          link.click();
        });
  }
  

}

