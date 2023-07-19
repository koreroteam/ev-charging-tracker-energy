import { Component } from '@angular/core';
import { NbColorHelper, NbThemeService } from '@nebular/theme';
import { Router } from '@angular/router';
import { ChargingInfraPointChartsComponent } from '../charging-infra-point-charts/charging-infra-point-charts.component';

@Component({
  selector: 'ngx-ecommerce',
  styleUrls: ['./e-commerce.component.scss'],
  templateUrl: './e-commerce.component.html',
})

export class ECommerceComponent {

  data: any;
  options: any;
  themeSubscription: any;

  constructor(private theme: NbThemeService,private router: Router) {
    this.themeSubscription = this.theme.getJsTheme().subscribe(config => {

      const colors: any = config.variables;
      const chartjs: any = config.variables.chartjs;

     





     /*  this.data = {
        labels: ['1/1/2017', '4/1/2017', '7/1/2017', '10/1/2017', '1/1/2018', '4/1/2018', '7/1/2018', '10/1/2018', '1/1/2019', '4/1/2019', '7/1/2019', '10/1/2019', '1/1/2020', '4/1/2020', '7/1/2020', '10/1/2020', '1/1/2021', '4/1/2021', '7/1/2021', '10/1/2021', '1/1/2022', '4/1/2022'],
        datasets: [{
          data: [5938, 6533, 7146, 8184, 9469, 10415, 11919, 13819, 16696, 18576, 20794, 23201, 26058, 28177, 30200, 32525, 35847, 38576, 41601, 44179, 47585, 50712],
          label: 'Normalladepunkte',
          backgroundColor: NbColorHelper.hexToRgbA("#3B78A4", 0.8),
        }, {
          data: [638, 705, 820, 1123, 1360, 1587, 1766, 2094, 2461, 2716, 3056, 3426, 3833, 4189, 4553, 5018, 5752, 6183, 6674, 7460, 8438, 8967],
          label: 'Schnellladepunkte',
          backgroundColor: NbColorHelper.hexToRgbA("#ff7f50", 0.8),
        }],
      };

 */
      // this.data = {
      //   labels: ['1/1/2017', '4/1/2017', '7/1/2017', '10/1/2017', '1/1/2018', '4/1/2018', '7/1/2018','10/1/2018'],
      //   datasets: [{
      //     data: [5938, 6533, 7146, 8184, 9469, 10415, 11919,13819],
      //     label: 'Normalladepunkte',
      //     backgroundColor: NbColorHelper.hexToRgbA(colors.darkBlue, 0.8),
      //   }, {
      //     data: [638, 705, 820, 1123, 1360, 1587, 1766,2094],
      //     label: 'Schnellladepunkte',
      //     backgroundColor: NbColorHelper.hexToRgbA(colors.orange, 0.8),
      //   }],
      // };


      this.options = {
        maintainAspectRatio: false,
        responsive: true,
        legend: {
          labels: {
            fontColor: chartjs.textColor,
          },
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false,
                color: chartjs.axisLineColor,
              },
              ticks: {
                fontColor: chartjs.textColor,
              },
            },
          ],
          yAxes: [
            {
              gridLines: {
                display: true,
                color: chartjs.axisLineColor,
              },
              ticks: {
                fontColor: chartjs.textColor,
              },
            },
          ],
        },
      };
    });
  }


  navigateToChargePoint() {
    this.router.navigate(['/pages/charging-infra-charts']);
  }

  navigateToLeistung() {
    this.router.navigate(['/pages/charging-infra-point-power-charts']);
  }

  navigateToList() {
    this.router.navigate(['/pages/charging-stations']);
  }

  navigateToKarte() {
    this.router.navigate(['/pages/charging-infra']);
  }

 
  navigateToHeatKarte() {
    this.router.navigate(['/pages/charging-infra-state']);
  }

  navigateToBelegung() {
    this.router.navigate(['/pages/charging-dynamic-stats']);
  }

  navigateToBelegungZeit() {
    this.router.navigate(['/pages/charging-infra-occupied-time']);
  }
  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }
}


