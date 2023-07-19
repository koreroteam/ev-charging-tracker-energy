import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargingInfraPointPowerMonthChartsComponent } from './charging-infra-point-power-month-charts.component';

describe('ChargingInfraPointPowerMonthChartsComponent', () => {
  let component: ChargingInfraPointPowerMonthChartsComponent;
  let fixture: ComponentFixture<ChargingInfraPointPowerMonthChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargingInfraPointPowerMonthChartsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargingInfraPointPowerMonthChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
