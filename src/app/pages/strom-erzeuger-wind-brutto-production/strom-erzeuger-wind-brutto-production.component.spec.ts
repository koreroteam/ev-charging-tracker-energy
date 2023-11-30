import { ComponentFixture, TestBed } from '@angular/core/testing';

import {StromErzeugerWindBruttoProductionComponent } from './strom-erzeuger-wind-brutto-production.component';

describe('StromErzeugerWindBruttoProductionComponent', () => {
  let component: StromErzeugerWindBruttoProductionComponent ;
  let fixture: ComponentFixture<StromErzeugerWindBruttoProductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StromErzeugerWindBruttoProductionComponent]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StromErzeugerWindBruttoProductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
