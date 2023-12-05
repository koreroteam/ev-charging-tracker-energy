import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StromErzeugerBarChartNettoProductionComponent } from './strom-erzeuger-bar-chart-netto-production.component';

describe('StromErzeugerBarChartNettoProductionComponent', () => {
  let component: StromErzeugerBarChartNettoProductionComponent;
  let fixture: ComponentFixture<StromErzeugerBarChartNettoProductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StromErzeugerBarChartNettoProductionComponent]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StromErzeugerBarChartNettoProductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
