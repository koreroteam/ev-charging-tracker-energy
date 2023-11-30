import { ComponentFixture, TestBed } from '@angular/core/testing';

import {StromErzeugerStromSpeicherBruttoProductionComponent } from './strom-erzeuger-strom-speicher-brutto-production.component';

describe('StromErzeugerStromSpeicherBruttoProductionComponent', () => {
  let component: StromErzeugerStromSpeicherBruttoProductionComponent ;
  let fixture: ComponentFixture<StromErzeugerStromSpeicherBruttoProductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StromErzeugerStromSpeicherBruttoProductionComponent]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StromErzeugerStromSpeicherBruttoProductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
