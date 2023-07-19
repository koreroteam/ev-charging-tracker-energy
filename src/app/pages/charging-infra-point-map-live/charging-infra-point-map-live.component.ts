import { Component, OnInit } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { SmartLabService } from '../../service/evp/smartlabs.service';

@Component({
  selector: 'ngx-charging-infra-point-map-live',
  templateUrl: './charging-infra-point-map-live.component.html',
  styleUrls: ['./charging-infra-point-map-live.component.scss']
})
export class ChargingInfraPointMapLiveComponent implements OnInit {

  constructor(private theme: NbThemeService,private apiService: SmartLabService) {
    this.themeSubscription = this.theme.getJsTheme().subscribe(config => {
      const colors: any = config.variables;
      this.colorScheme = {
        domain: [colors.primaryLight, colors.infoLight, colors.successLight, colors.warningLight, colors.dangerLight],
      };
    });
  }

  async ngOnInit() {
    // (await this.apiService.getCharttData())
    //   .subscribe(data => {
    //     this.results = data;
    //     console.log(data);
    //   });
  }

  results=[];

  showLegend = true;
  showXAxis = true;
  showYAxis = true;
  xAxisLabel = 'Dates';
  yAxisLabel = 'NumberOfStations';
  colorScheme: any;
  themeSubscription: any;



  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }

}
