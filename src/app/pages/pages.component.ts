import { Component } from '@angular/core';

import { MENU_ITEMS } from './pages-menu';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
   styles: [`
  
   <link href="https://db.onlinewebfonts.com/c/dba3e777ccc7fa4a896dcf7e7f5b3bfb?family=Biome+W01+Regular" rel="stylesheet">
   :host nb-menu,         
:host nb-menu a,        
:host nb-menu span {
     font-family: 'Biome W01 Regular', sans-serif;
   }
 `]
 

})
export class PagesComponent {

  menu = MENU_ITEMS;
}
