import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargingInfraPointWeekChartsComponent } from './charging-infra-point-week-charts.component';

describe('ChargingInfraPointWeekChartsComponent', () => {
  let component: ChargingInfraPointWeekChartsComponent;
  let fixture: ComponentFixture<ChargingInfraPointWeekChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargingInfraPointWeekChartsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargingInfraPointWeekChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
