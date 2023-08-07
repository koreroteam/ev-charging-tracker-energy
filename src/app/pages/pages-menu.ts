import { NbMenuItem } from '@nebular/theme';
import { lineArc } from '@turf/turf';

export const MENU_ITEMS: NbMenuItem[] = [
    {
    title: 'Home',
    icon: 'home-outline',
    link: '/pages/dashboard',
  },
  {
    title: 'Anzahl Ladepunkte',
    icon: 'bar-chart-outline',
    children: [
      {
        title: 'Täglich',
        link: '/pages/charging-infra-charts',
      },
      {
        title: 'Wöchentlich',
        link: '/pages/charging-infra-point-week-charts',
      },
       {
        title: 'Monatlich',
        link: '/pages/charging-infra-point-month-charts',
      }
    ],
  },
  {
    title: 'Leistung Ladepunkte',
    icon: 'bar-chart-outline',
    children: [
      {
        title: 'Täglich',
        link: '/pages/charging-infra-point-power-charts',
      },
      {
        title: 'Wöchentlich',
        link: '/pages/charging-infra-point-power-week-charts',
      },
       {
        title: 'Monatlich',
        link: '/pages/charging-infra-point-power-month-charts',
      }
    ],
  },
   {
    title: 'Liste Ladepunkte',
    icon: 'list-outline',
    link: '/pages/charging-stations',
  },
  {
    title: 'Karte Ladepunkte',
    icon: 'map-outline',
    link: '/pages/charging-infra',
  },
  
  {
    title: 'Heat Map Ladepunkte',
    icon: 'map-outline',
    children: [
      {
        title: 'Anzahl Ladepunkte',
        children: [
      {
        title: 'Gesamt',
        link: '/pages/charging-infra-state',
      },
      { 
        title: 'Je km²',
        link: '/pages/charging-infra-heat-map-area',
      },
      {
        title: 'Je Einwohner/km²',
        link: '/pages/charging-infra-heat-map-population',
      },
      {
        title:'Je BEV',
        link:'/pages/charging-infra-heat-map-bevs-number',

      },
      ],
      },  
      { 
        title: 'Ladeleistung',
        children: [    
      {
        title:'Gesamt',
        link:'/pages/charging-infra-heat-map-power',
      },
      {
        title:'Je km²',
        link:'/pages/charging-infra-heat-map-power-area',
      },
      {
        title:'Je Einwohner/km²',
        link:'/pages/charging-infra-heat-map-power-population',
      },
      {
        title:'Je BEV',
        link:'/pages/charging-infra-heat-map-bevs-power',
      },
    ],
  },
      ],
   }, 
   {
    title: 'Heat Map Strom Erzeuger',
    icon: 'map-outline',
    children: [
      {
        title: 'Anzahl Strom Erzeuger',
        children: [
      {
        title: 'Strom Erzeuger Solar',
        link: '/pages/strom-erzeuger-solar',
      },
      
      ],
      },  
      { 
        title: 'Ladeleistung',
        children: [    
      {
        title:'Strom Erzeuger Solar',
        link:'/pages/strom-erzeuger-solar-netto-leistung',
      },
      
    ],
  },
  { 
    title: 'Ratio',
    children: [    
  {
    title:'Strom Erzeuger Solar Ratio',
    link:'/pages/strom-erzeuger-solar-netto-leistung-ratio',
  },
  
],
},
      ],
   },
  /* {
    title: 'Heat Map Ladepunkte',
    icon: 'map-outline',
    link: '/pages/charging-infra-state',
  },  */ 
  // {
  //  title: 'Belegstatus',
  //  icon: 'flash',
  //  link: '/pages/charging-infra-dynamic',
 // },
  {
    title: 'Belegungsstatus',
    icon: 'flash',
    children: [
  {
    title:'Statistik',
    link: '/pages/charging-dynamic-stats',
  },
  {
    title:'Heat Map',
    link:'/pages/charging-infra-heat-map-occupied-time-percentage',
  },
  ],
},
  {
    title:'Belegungszeit',
    icon:'activity-outline',
    children: [
  {
    title:'Statistik',
    link:'/pages/charging-infra-occupied-time',
  },
  {
    title:'Heat Map',
    link:'/pages/charging-infra-heat-map-occupied-time',
  },
  ],
}
  //{
    // title: 'Auth',
    // icon: 'lock-outline',
    // children: [
    //  {
    //    title: 'Login',
    //    link: '/auth/login',
    //  },
    //  {
     //   title: 'Register',
     //   link: '/auth/register',
     // }
   // ],
 // },
];

