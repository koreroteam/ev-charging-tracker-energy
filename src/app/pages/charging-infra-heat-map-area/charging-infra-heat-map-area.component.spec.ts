import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargingInfraHeatMapAreaComponent } from './charging-infra-heat-map-area.component';

describe('ChargingInfraHeatMapAreaComponent', () => {
  let component: ChargingInfraHeatMapAreaComponent;
  let fixture: ComponentFixture<ChargingInfraHeatMapAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargingInfraHeatMapAreaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargingInfraHeatMapAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
