import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargingInfraHeatMapOccupiedTimePercentageComponent } from './charging-infra-heat-map-occupied-time-percentage.component';

describe('ChargingInfraHeatMapOccupiedTimePercentageComponent', () => {
  let component: ChargingInfraHeatMapOccupiedTimePercentageComponent;
  let fixture: ComponentFixture<ChargingInfraHeatMapOccupiedTimePercentageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargingInfraHeatMapOccupiedTimePercentageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargingInfraHeatMapOccupiedTimePercentageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
