import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargingInfraHeatMapOccupiedTimeComponent } from './charging-infra-heat-map-occupied-time.component';

describe('ChargingInfraHeatMapOccupiedTimeComponent', () => {
  let component: ChargingInfraHeatMapOccupiedTimeComponent;
  let fixture: ComponentFixture<ChargingInfraHeatMapOccupiedTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargingInfraHeatMapOccupiedTimeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargingInfraHeatMapOccupiedTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
