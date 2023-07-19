import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargingInfraHeatMapPowerComponent } from './charging-infra-heat-map-power.component';

describe('ChargingInfraHeatMapPowerComponent', () => {
  let component: ChargingInfraHeatMapPowerComponent;
  let fixture: ComponentFixture<ChargingInfraHeatMapPowerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargingInfraHeatMapPowerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargingInfraHeatMapPowerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
