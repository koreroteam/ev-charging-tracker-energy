import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StromErzeugerSolarNettoProductionComponent } from './strom-erzeuger-solar-netto-production.component';
import { StromErzeugerSolarComponent } from '../strom-erzeuger-solar/strom-erzeuger-solar.component';

describe('ChargingInfraHeatMapComponent', () => {
  let component: StromErzeugerSolarNettoProductionComponent;
  let fixture: ComponentFixture<StromErzeugerSolarNettoProductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StromErzeugerSolarNettoProductionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StromErzeugerSolarNettoProductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
