import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargingInfraHeatMapPopulationComponent } from './charging-infra-heat-map-population.component';

describe('ChargingInfraHeatMapAreaComponent', () => {
  let component: ChargingInfraHeatMapPopulationComponent;
  let fixture: ComponentFixture<ChargingInfraHeatMapPopulationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargingInfraHeatMapPopulationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargingInfraHeatMapPopulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
