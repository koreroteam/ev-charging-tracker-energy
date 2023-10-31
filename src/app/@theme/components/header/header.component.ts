import { Component, OnDestroy, OnInit, Renderer2, ElementRef } from '@angular/core';

import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';
import { Router } from '@angular/router';

import { UserData } from '../../../@core/data/users';
import { LayoutService } from '../../../@core/utils';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IconsComponent } from '../../../pages/ui-features/icons/icons.component';

interface CardSettings {
 
  iconClass: string;

 
}

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
  
})
export class HeaderComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: any;
  
  dropdownOpenLadepunktInfo = false;
  dropdownOpenKarteLadepunkt = false;
  dropdownOpenBelegungsInfo= false;



  //Ladepunkt Info
  dropdownOpenAnzahlLadepunkt = false;
  dropdownOpenLeistung = false;

  //Karte Ladepunkt
  dropdownOpenMapAnzahlLadepunkt = false;
  dropdownOpenMapLeistung = false;
  dropdownOpenMapStromErzeuger = false;

  //belegungsinfo

  dropdownOpenBelegungsStatus = false;
  dropdownOpenBelegungsZeit = false;
  

  
  totalNumberCard: CardSettings = {
   
    iconClass: 'bar-chart-outline',

  };

  mapCard: CardSettings={
    iconClass: 'map-outline',
  }

  statusCard: CardSettings={
    iconClass: 'flash',
  }

  belegungszeitCard: CardSettings={
    iconClass: 'activity-outline',
  }

  homeCard: CardSettings ={
    iconClass: 'home-outline',
  }

  themes = [
    {
      value: 'default',
      name: 'Light',
    },
    {
      value: 'dark',
      name: 'Dark',
    },
    {
      value: 'cosmic',
      name: 'Cosmic',
    },
    {
      value: 'corporate',
      name: 'Corporate',
    },
  ];

  currentTheme = 'default';

  userMenu = [ { title: 'Profile' }, { title: 'Log out' } ];

  constructor(private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private userService: UserData,
    private layoutService: LayoutService,
    private breakpointService: NbMediaBreakpointsService,
    private router: Router,
    private renderer: Renderer2,
    private elRef: ElementRef) {
  }

  ngOnInit() {
    this.currentTheme = this.themeService.currentTheme;

    this.userService.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe((users: any) => this.user = users.evadmin);

    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => this.currentTheme = themeName);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    this.router.navigate(['/pages/iot-dashboard']);
  }

 
  navigateAnzahlLadepunkteTaeglich() {
    this.router.navigate(['/pages/charging-infra-charts']);
  }

  navigateAnzahlLadepunkteWoechentlich() {
    this.router.navigate(['/pages/charging-infra-point-week-charts']);
  }

  navigateAnzahlLadepunkteMonatlich() {
    this.router.navigate(['/pages/charging-infra-point-month-charts']);
  }

  navigateLeistungLadepunkteTaeglich() {
    this.router.navigate(['/pages/charging-infra-point-power-charts']);
  }

  navigateLeistungLadepunkteWoechentlich() {
    this.router.navigate(['/pages/charging-infra-point-power-week-charts']);
  }

  navigateLeistungLadepunkteMonatlich() {
    this.router.navigate(['/pages/charging-infra-point-power-month-charts']);
  }

  navigateListLadepunkte() {
    this.router.navigate(['/pages/charging-stations']);
  }



navigateKarteLadepunkte() {
  this.router.navigate(['/pages/charging-infra']);
}

navigateHeatMapLadepunkteGesamt() {
  this.router.navigate(['/pages/charging-infra-state']);
}

navigateHeatMapLadepunkteJeKm2() {
  this.router.navigate(['/pages/charging-infra-heat-map-area']);
}

navigateHeatMapLadepunkteJeEinwohnerKm2() {
  this.router.navigate(['/pages/charging-infra-heat-map-population']);
}

navigateHeatMapLadepunkteJeBEV() {
  this.router.navigate(['/pages/charging-infra-heat-map-bevs-number']);
}

navigateHeatMapLadeleistungGesamt() {
  this.router.navigate(['/pages/charging-infra-heat-map-power']);
}

navigateHeatMapLadeleistungJeKm2() {
  this.router.navigate(['/pages/charging-infra-heat-map-power-area']);
}

navigateHeatMapLadeleistungJeEinwohnerKm2() {
  this.router.navigate(['/pages/charging-infra-heat-map-power-population']);
}

navigateHeatMapLadeleistungJeBEV() {
  this.router.navigate(['/pages/charging-infra-heat-map-bevs-power']);
}

navigateHeatMapStromErzeugerSolar() {
  this.router.navigate(['/pages/strom-erzeuger-solar']);
}

navigateStromErzeugerSolarNettoLeistung() {
  this.router.navigate(['/pages/strom-erzeuger-solar-netto-leistung']);
}

navigateStromErzeugerSolarRatio() {
  this.router.navigate(['/pages/strom-erzeuger-solar-netto-leistung-ratio']);
}

navigateChargingDynamicStats() {
  this.router.navigate(['/pages/charging-dynamic-stats']);
}

navigateChargingInfraHeatMapOccupiedTimePercentage() {
  this.router.navigate(['/pages/charging-infra-heat-map-occupied-time-percentage']);
}

navigateChargingInfraOccupiedTime() {
  this.router.navigate(['/pages/charging-infra-occupied-time']);
}

navigateChargingInfraHeatMapOccupiedTime() {
  this.router.navigate(['/pages/charging-infra-heat-map-occupied-time']);
}

}

