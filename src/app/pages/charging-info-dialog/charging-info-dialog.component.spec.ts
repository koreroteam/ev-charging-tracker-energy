import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargingInfoDialogComponent } from './charging-info-dialog.component';

describe('ChargingInfoDialogComponent', () => {
  let component: ChargingInfoDialogComponent;
  let fixture: ComponentFixture<ChargingInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargingInfoDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargingInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
