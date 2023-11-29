import { RouterModule, Routes } from '@angular/router';
import { Component, NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ECommerceComponent } from './e-commerce/e-commerce.component';
import { NotFoundComponent } from './miscellaneous/not-found/not-found.component';
import { ChargingInfraPointMapComponent } from './charging-infra-point-map/charging-infra-point-map.component';
import { ChargingInfraHeatMapComponent } from './charging-infra-heat-map/charging-infra-heat-map.component';
import { ChargingPointListComponent } from './charging-point-list/charging-point-list.component';
import { ChargingInfroDynamicComponent } from './charging-infro-dynamic/charging-infro-dynamic.component';
import { ChargingInfraPointMapLiveComponent } from './charging-infra-point-map-live/charging-infra-point-map-live.component';
import { ChargingInfraPointChartsComponent } from './charging-infra-point-charts/charging-infra-point-charts.component';
import { ChargingDynamicStatsComponent } from './charging-dynamic-stats/charging-dynamic-stats.component';
import { ChargingInfraPointPowerChartsComponent } from './charging-infra-point-power-charts/charging-infra-point-power-charts.component';
import { ChargingInfraPointMonthChartsComponent } from './charging-infra-point-month-charts/charging-infra-point-month-charts.component';
import { ChargingInfraPointWeekChartsComponent } from './charging-infra-point-week-charts/charging-infra-point-week-charts.component';
import { ChargingInfraPointPowerWeekChartsComponent } from './charging-infra-point-power-week-charts/charging-infra-point-power-week-charts.component';
import { ChargingInfraPointPowerMonthChartsComponent } from './charging-inra-point-power-month-charts/charging-infra-point-power-month-charts.component';
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


const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
      path: 'dashboard',
      component: ECommerceComponent,
    },
    {
      path: 'iot-dashboard',
      component: DashboardComponent,
    },
    {
      path: 'charging-stations',
      component: ChargingPointListComponent,
    },
    {
      path: 'charging-infra',
      component: ChargingInfraPointMapComponent,
    },
    {
      path: 'charging-infra-live',
      component: ChargingInfraPointMapLiveComponent,
    },
    {
      path: 'charging-infra-charts',
      component: ChargingInfraPointChartsComponent,
    },
    {
      path:'charging-infra-point-power-charts',
      component: ChargingInfraPointPowerChartsComponent,
    },
    {
      path:'charging-infra-point-power-week-charts',
      component: ChargingInfraPointPowerWeekChartsComponent
    },
    {
      path:'charging-infra-point-power-month-charts',
      component: ChargingInfraPointPowerMonthChartsComponent
    },
    {
      path:'charging-infra-point-month-charts',
      component:ChargingInfraPointMonthChartsComponent,
    },
    {
      path:'charging-infra-point-week-charts',
      component: ChargingInfraPointWeekChartsComponent,
    },
    {
      path: 'charging-infra-state',
      component: ChargingInfraHeatMapComponent,
    },
    {
      path:'charging-infra-heat-map-area',
      component: ChargingInfraHeatMapAreaComponent,
    },
    {
      path:'charging-infra-heat-map-population',
      component: ChargingInfraHeatMapPopulationComponent,
    },
    {
      path:'charging-infra-heat-map-power',
      component:ChargingInfraHeatMapPowerComponent,
    },
    {
      path:'charging-infra-heat-map-power-area',
      component:ChargingInfraHeatMapPowerAreaComponent,
    },
    {
      path:'charging-infra-heat-map-power-population',
      component:ChargingInfraHeatMapPowerPopulationComponent,
    },
    {
      path:'charging-infra-heat-map-occupied-time',
      component: ChargingInfraHeatMapOccupiedTimeComponent,
    },
    {
      path: 'charging-infra-dynamic',
      component: ChargingInfroDynamicComponent,
    },
    {
      path: 'charging-dynamic-stats',
      component: ChargingDynamicStatsComponent,
    },
    {
      path:'charging-infra-occupied-time',
      component: ChargingInfraOccupiedTimeComponent,
    },
    {
      path:'charging-infra-heat-map-occupied-time-percentage',
      component: ChargingInfraHeatMapOccupiedTimePercentageComponent,
    },
    {
      path:'charging-infra-heat-map-bevs-number',
      component:ChargingInfraHeatMapBevsNumberComponent,
    },
    {
      path:'charging-infra-heat-map-bevs-power',
      component:ChargingInfraHeatMapBevsPowerComponent,
    },
    {
      path:'strom-erzeuger-solar',
      component:StromErzeugerSolarComponent,
    },
    {
      path:'strom-erzeuger-solar-netto-leistung',
      component: StromErzeugerSolarNettoLeistungComponent,
    },
    {
      path:'strom-erzeuger-solar-netto-leistung-ratio',
      component: StromErzeugerSolarNettoLeistungRatioComponent,
    },
    {
      path:'strom-erzeuger-solar-netto-production',
      component: StromErzeugerSolarNettoProductionComponent,
    },
    {
      path:'strom-erzeuger-solar-brutto-production',
      component: StromErzeugerSolarBruttoProductionComponent,
    },
    {
      path: 'layout',
      loadChildren: () => import('./layout/layout.module')
        .then(m => m.LayoutModule),
    },
    {
      path: 'forms',
      loadChildren: () => import('./forms/forms.module')
        .then(m => m.FormsModule),
    },
    {
      path: 'ui-features',
      loadChildren: () => import('./ui-features/ui-features.module')
        .then(m => m.UiFeaturesModule),
    },
    {
      path: 'modal-overlays',
      loadChildren: () => import('./modal-overlays/modal-overlays.module')
        .then(m => m.ModalOverlaysModule),
    },
    {
      path: 'extra-components',
      loadChildren: () => import('./extra-components/extra-components.module')
        .then(m => m.ExtraComponentsModule),
    },
    {
      path: 'maps',
      loadChildren: () => import('./maps/maps.module')
        .then(m => m.MapsModule),
    },
    {
      path: 'charts',
      loadChildren: () => import('./charts/charts.module')
        .then(m => m.ChartsModule),
    },
    {
      path: 'editors',
      loadChildren: () => import('./editors/editors.module')
        .then(m => m.EditorsModule),
    },
    {
      path: 'tables',
      loadChildren: () => import('./tables/tables.module')
        .then(m => m.TablesModule),
    },
    {
      path: 'miscellaneous',
      loadChildren: () => import('./miscellaneous/miscellaneous.module')
        .then(m => m.MiscellaneousModule),
    },
    {
      path: '',
      redirectTo: 'iot-dashboard',
      pathMatch: 'full',
    },
    {
      path: '**',
      component: NotFoundComponent,
    },
    {
      path: '#close',
      redirectTo: 'charging-infra-state'
    }
    
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}

