import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StromErzeugerSolarBruttoProductionComponent } from './strom-erzeuger-solar-brutto-production.component';
import { StromErzeugerSolarComponent } from '../strom-erzeuger-solar/strom-erzeuger-solar.component';

describe('ChargingInfraHeatMapComponent', () => {
  let component: StromErzeugerSolarBruttoProductionComponent ;
  let fixture: ComponentFixture<StromErzeugerSolarBruttoProductionComponent >;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StromErzeugerSolarBruttoProductionComponent  ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StromErzeugerSolarBruttoProductionComponent );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
