import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargingInfraPointPowerChartsComponent } from './charging-infra-point-power-charts.component';

describe('ChargingInfraPointPowerChartsComponent', () => {
  let component: ChargingInfraPointPowerChartsComponent;
  let fixture: ComponentFixture<ChargingInfraPointPowerChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargingInfraPointPowerChartsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargingInfraPointPowerChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
