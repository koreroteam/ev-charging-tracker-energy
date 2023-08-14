import { Component } from '@angular/core';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <span class="created-by">
    
    <link href="https://db.onlinewebfonts.com/c/dba3e777ccc7fa4a896dcf7e7f5b3bfb?family=Biome+W01+Regular" rel="stylesheet">
      @ CopyRights Reserved <b><a href="https://www.bdew.de" target="_blank">BDEW</a></b> 2023
     
    </span>
   <!--  <div class="socials">
      <a href="#" target="_blank" class="ion ion-social-github"></a>
      <a href="#" target="_blank" class="ion ion-social-facebook"></a>
      <a href="#" target="_blank" class="ion ion-social-twitter"></a>
      <a href="#" target="_blank" class="ion ion-social-linkedin"></a>
    </div> -->
  `,
})
export class FooterComponent {
}
