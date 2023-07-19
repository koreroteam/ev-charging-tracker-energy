import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargingInfraPointMonthChartsComponent } from './charging-infra-point-month-charts.component';

describe('ChargingInfraPointMonthChartsComponent', () => {
  let component: ChargingInfraPointMonthChartsComponent;
  let fixture: ComponentFixture<ChargingInfraPointMonthChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargingInfraPointMonthChartsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargingInfraPointMonthChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
