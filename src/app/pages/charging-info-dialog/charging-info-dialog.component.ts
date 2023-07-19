import { Component, Input, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'ngx-charging-info-dialog',
  templateUrl: './charging-info-dialog.component.html',
  styleUrls: ['./charging-info-dialog.component.scss']
})
export class ChargingInfoDialogComponent {

  @Input() title: string;
  @Input() data:any;

  constructor(protected ref: NbDialogRef<ChargingInfoDialogComponent>) {}

  dismiss() {
    this.ref.close();
  }

}
