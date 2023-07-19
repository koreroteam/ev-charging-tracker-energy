import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargingInfraHeatMapBevsPowerComponent } from './charging-infra-heat-map-bevs-power.component';

describe('ChargingInfraHeatMapBevsPowerComponent', () => {
  let component: ChargingInfraHeatMapBevsPowerComponent;
  let fixture: ComponentFixture<ChargingInfraHeatMapBevsPowerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargingInfraHeatMapBevsPowerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargingInfraHeatMapBevsPowerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
