import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StromErzeugerBarChartBruttoProductionComponent } from './stom-erzeuger-bar-chart-brutto-production.component';

describe('StromErzeugerBarChartBruttoProductionComponent', () => {
  let component: StromErzeugerBarChartBruttoProductionComponent;
  let fixture: ComponentFixture<StromErzeugerBarChartBruttoProductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StromErzeugerBarChartBruttoProductionComponent]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StromErzeugerBarChartBruttoProductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
