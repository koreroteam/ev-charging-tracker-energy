import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargingInfraPointChartsComponent } from './charging-infra-point-charts.component';

describe('ChargingInfraPointChartsComponent', () => {
  let component: ChargingInfraPointChartsComponent;
  let fixture: ComponentFixture<ChargingInfraPointChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargingInfraPointChartsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargingInfraPointChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
