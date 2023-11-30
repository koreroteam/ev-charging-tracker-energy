import { ComponentFixture, TestBed } from '@angular/core/testing';

import {StromErzeugerWindNettoProductionComponent} from './strom-erzeuger-wind-netto-production.component';

describe('StromErzeugerWindNettoProductionComponent', () => {
  let component:StromErzeugerWindNettoProductionComponent ;
  let fixture: ComponentFixture<StromErzeugerWindNettoProductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StromErzeugerWindNettoProductionComponent]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StromErzeugerWindNettoProductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
