import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StromErzeugerSolarComponent } from './strom-erzeuger-solar.component';

describe('ChargingInfraHeatMapComponent', () => {
  let component: StromErzeugerSolarComponent;
  let fixture: ComponentFixture<StromErzeugerSolarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StromErzeugerSolarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StromErzeugerSolarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
