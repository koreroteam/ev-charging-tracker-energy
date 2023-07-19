import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargingInfraHeatMapPowerAreaComponent } from './charging-infra-heat-map-power-area.component';

describe('ChargingInfraHeatMapPowerAreaComponent', () => {
  let component: ChargingInfraHeatMapPowerAreaComponent;
  let fixture: ComponentFixture<ChargingInfraHeatMapPowerAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargingInfraHeatMapPowerAreaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargingInfraHeatMapPowerAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
