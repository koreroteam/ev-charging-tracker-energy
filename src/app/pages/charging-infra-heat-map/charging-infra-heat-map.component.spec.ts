import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargingInfraHeatMapComponent } from './charging-infra-heat-map.component';

describe('ChargingInfraHeatMapComponent', () => {
  let component: ChargingInfraHeatMapComponent;
  let fixture: ComponentFixture<ChargingInfraHeatMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargingInfraHeatMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargingInfraHeatMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
