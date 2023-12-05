import { NgModule } from '@angular/core';
import { NbButton, NbButtonModule, NbCalendarRangeModule, NbCardModule, NbCheckboxModule, NbDatepickerModule, NbIconModule, NbInputModule, NbMenuModule, NbNativeDateService, NbRangepickerComponent, NbSelectComponent, NbSelectModule, NbTreeGridModule } from '@nebular/theme';

import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { ECommerceModule } from './e-commerce/e-commerce.module';
import { PagesRoutingModule } from './pages-routing.module';
import { MiscellaneousModule } from './miscellaneous/miscellaneous.module';
import { ChargingInfraPointMapComponent } from './charging-infra-point-map/charging-infra-point-map.component';
import { ChargingInfraHeatMapComponent } from './charging-infra-heat-map/charging-infra-heat-map.component';
import { ChargingPointListComponent } from './charging-point-list/charging-point-list.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ChargingInfroDynamicComponent } from './charging-infro-dynamic/charging-infro-dynamic.component';
import { ChargingInfraPointMapLiveComponent } from './charging-infra-point-map-live/charging-infra-point-map-live.component';
import { D3BarComponent } from './charts/d3/d3-bar.component';
import { ChartModule } from 'angular2-chartjs';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChargingInfraPointChartsComponent } from './charging-infra-point-charts/charging-infra-point-charts.component';
import { ChargingDynamicStatsComponent } from './charging-dynamic-stats/charging-dynamic-stats.component';
import { ChargingInfoDialogComponent } from './charging-info-dialog/charging-info-dialog.component';
import { ChargingInfraPointPowerChartsComponent } from './charging-infra-point-power-charts/charging-infra-point-power-charts.component';
import { FormsModule } from '@angular/forms';
import { ChargingInfraPointMonthChartsComponent } from './charging-infra-point-month-charts/charging-infra-point-month-charts.component';
import { ChargingInfraPointWeekChartsComponent } from './charging-infra-point-week-charts/charging-infra-point-week-charts.component';
import { ChargingInfraPointPowerWeekChartsComponent } from './charging-infra-point-power-week-charts/charging-infra-point-power-week-charts.component';
import { ChargingInfraPointPowerMonthChartsComponent } from './charging-inra-point-power-month-charts/charging-infra-point-power-month-charts.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ChargingInfraHeatMapAreaComponent } from './charging-infra-heat-map-area/charging-infra-heat-map-area.component';
import { ChargingInfraHeatMapPopulationComponent } from './charging-infra-heat-map-population-bezirk/charging-infra-heat-map-population.component';
import { ChargingInfraHeatMapPowerComponent } from './charging-infra-heat-map-power/charging-infra-heat-map-power.component';
import { ChargingInfraHeatMapPowerAreaComponent } from './charging-infra-heat-map-power-area/charging-infra-heat-map-power-area.component';
import { ChargingInfraHeatMapPowerPopulationComponent } from './charging-infra-heat-map-power-population/charging-infra-heat-map-power-population.component';
import { ChargingInfraOccupiedTimeComponent } from './charging-infra-occupied-time/charging-infra-occupied-time.component';
import { ChargingInfraHeatMapOccupiedTimeComponent } from './charging-infra-heat-map-occupied-time/charging-infra-heat-map-occupied-time.component';
import { ChargingInfraHeatMapOccupiedTimePercentageComponent } from './charging-infra-heat-map-occupied-time-percentage/charging-infra-heat-map-occupied-time-percentage.component';
import { ChargingInfraHeatMapBevsNumberComponent } from './charging-infra-heat-map-bevs-number/charging-infra-heat-map-bevs-number.component';
import { ChargingInfraHeatMapBevsPowerComponent } from './charging-infra-heat-map-bevs-power/charging-infra-heat-map-bevs-power.component';
import { StromErzeugerSolarComponent } from './strom-erzeuger-solar/strom-erzeuger-solar.component';
import { StromErzeugerSolarNettoLeistungComponent } from './strom-erzeuger-solar-netto-leistung/strom-erzeuger-solar-netto-leistung.component';
import { StromErzeugerSolarNettoLeistungRatioComponent } from './strom-erzeuger-solar-netto-leistung-ratio/strom-erzeuger-solar-netto-leistung-ratio.component';
import { StromErzeugerSolarNettoProductionComponent } from './strom-erzeuger-solar-netto-production/strom-erzeuger-solar-netto-production.component';
import { StromErzeugerSolarBruttoProductionComponent } from './strom-erzeuger-solar-brutto-production/strom-erzeuger-solar-brutto-production.component';
import { StromErzeugerStromSpeicherTotalNumberComponent } from './strom-erzeuger-strom-speicher-total-number/strom-erzeuger-strom-speicher-total-number.component'; 
import { StromErzeugerStromSpeicheNettoProductionComponent } from './strom-erzeuger-strom-speicher-netto-production/strom-erzeuger-strom-speicher-netto-production.component'; 
import { StromErzeugerStromSpeicherBruttoProductionComponent } from './strom-erzeuger-strom-speicher-brutto-production/strom-erzeuger-strom-speicher-brutto-production.component';
import { StromErzeugerWindTotalNumberComponent } from './strom-erzeuger-wind-total-number/strom-erzeuger-wind-total-number.component';
import { StromErzeugerWindBruttoProductionComponent } from './strom-erzeuger-wind-brutto-production/strom-erzeuger-wind-brutto-production.component';
import { StromErzeugerWindNettoProductionComponent } from './strom-erzeuger-wind-netto-production/strom-erzeuger-wind-netto-production.component';
import { StromErzeugerBarChartTotalNumberComponent } from './strom-erzeuger-bar-chart-total-number/strom-erzeuger-bar-chart-total-number.component';
import { StromErzeugerBarChartNettoProductionComponent } from './strom-erzeuger-bar-chart-netto-production/strom-erzeuger-bar-chart-netto-production.component';
import { StromErzeugerBarChartBruttoProductionComponent } from './stom-erzeuger-bar-chart-brutto-production/stom-erzeuger-bar-chart-brutto-production.component';


@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    DashboardModule,
    ECommerceModule,
    MiscellaneousModule,
    Ng2SmartTableModule,
    NbCardModule,
    NbTreeGridModule,
    NbIconModule,
    NbInputModule,
    Ng2SmartTableModule,
    NbSelectModule,
    NbButtonModule,    
    ChartModule,
    NgxEchartsModule,
    NgxChartsModule,
    NbDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    NbCheckboxModule,
   

  ],
  declarations: [
    PagesComponent,
    ChargingInfraPointMapComponent,
    ChargingInfraHeatMapComponent,
    ChargingPointListComponent,
    ChargingInfroDynamicComponent,
    ChargingInfraPointMapLiveComponent,
    ChargingInfraPointChartsComponent,
    ChargingDynamicStatsComponent,
    ChargingInfoDialogComponent,
    ChargingInfraPointPowerChartsComponent,
    ChargingInfraPointMonthChartsComponent,
    ChargingInfraPointWeekChartsComponent,
    ChargingInfraPointPowerWeekChartsComponent,
    ChargingInfraPointPowerMonthChartsComponent,
    ChargingInfraHeatMapAreaComponent,
    ChargingInfraHeatMapPopulationComponent,
    ChargingInfraHeatMapPowerComponent,
    ChargingInfraHeatMapPowerAreaComponent,
    ChargingInfraHeatMapPowerPopulationComponent,
    ChargingInfraOccupiedTimeComponent,
    ChargingInfraHeatMapOccupiedTimeComponent,
    ChargingInfraHeatMapOccupiedTimePercentageComponent,
    ChargingInfraHeatMapBevsNumberComponent,
    ChargingInfraHeatMapBevsPowerComponent,
    StromErzeugerSolarComponent,
    StromErzeugerSolarNettoLeistungComponent,
    StromErzeugerSolarNettoLeistungRatioComponent,
    StromErzeugerSolarNettoProductionComponent,
    StromErzeugerSolarBruttoProductionComponent,
    StromErzeugerStromSpeicherTotalNumberComponent,
    StromErzeugerStromSpeicherBruttoProductionComponent,
    StromErzeugerStromSpeicheNettoProductionComponent,
    StromErzeugerWindBruttoProductionComponent,
    StromErzeugerWindTotalNumberComponent,
    StromErzeugerWindNettoProductionComponent,
    StromErzeugerBarChartTotalNumberComponent,
    StromErzeugerBarChartNettoProductionComponent,
    StromErzeugerBarChartBruttoProductionComponent,
  
  ],
})
export class PagesModule {
}

