import { ComponentFixture, TestBed } from '@angular/core/testing';

import {StromErzeugerStromSpeicheNettoProductionComponent} from './strom-erzeuger-strom-speicher-netto-production.component';

describe('StromErzeugerStromSpeicheNettoProductionComponent', () => {
  let component:StromErzeugerStromSpeicheNettoProductionComponent ;
  let fixture: ComponentFixture<StromErzeugerStromSpeicheNettoProductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StromErzeugerStromSpeicheNettoProductionComponent]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StromErzeugerStromSpeicheNettoProductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
