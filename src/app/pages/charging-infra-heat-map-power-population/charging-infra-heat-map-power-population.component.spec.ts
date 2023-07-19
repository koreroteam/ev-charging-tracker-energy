import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargingInfraHeatMapPowerPopulationComponent } from './charging-infra-heat-map-power-population.component';

describe('ChargingInfraHeatMapPowerPopulationComponent', () => {
  let component: ChargingInfraHeatMapPowerPopulationComponent;
  let fixture: ComponentFixture<ChargingInfraHeatMapPowerPopulationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargingInfraHeatMapPowerPopulationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargingInfraHeatMapPowerPopulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
