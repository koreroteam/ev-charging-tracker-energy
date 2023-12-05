import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StromErzeugerBarChartTotalNumberComponent } from './strom-erzeuger-bar-chart-total-number.component';

describe('StromErzeugerBarChartTotalNumberComponent', () => {
  let component: StromErzeugerBarChartTotalNumberComponent;
  let fixture: ComponentFixture<StromErzeugerBarChartTotalNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StromErzeugerBarChartTotalNumberComponent]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StromErzeugerBarChartTotalNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
