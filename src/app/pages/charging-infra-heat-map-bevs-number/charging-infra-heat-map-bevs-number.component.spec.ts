import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargingInfraHeatMapBevsNumberComponent } from './charging-infra-heat-map-bevs-number.component';

describe('ChargingInfraHeatMapBevsNumberComponent', () => {
  let component: ChargingInfraHeatMapBevsNumberComponent;
  let fixture: ComponentFixture<ChargingInfraHeatMapBevsNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargingInfraHeatMapBevsNumberComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargingInfraHeatMapBevsNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
