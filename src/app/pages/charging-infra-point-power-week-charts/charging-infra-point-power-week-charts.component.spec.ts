import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargingInfraPointPowerWeekChartsComponent } from './charging-infra-point-power-week-charts.component';

describe('ChargingInfraPointPowerWeekChartsComponent', () => {
  let component: ChargingInfraPointPowerWeekChartsComponent;
  let fixture: ComponentFixture<ChargingInfraPointPowerWeekChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargingInfraPointPowerWeekChartsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargingInfraPointPowerWeekChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
