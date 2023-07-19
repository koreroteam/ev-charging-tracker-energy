import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargingDynamicStatsComponent } from './charging-dynamic-stats.component';

describe('ChargingDynamicStatsComponent', () => {
  let component: ChargingDynamicStatsComponent;
  let fixture: ComponentFixture<ChargingDynamicStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargingDynamicStatsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargingDynamicStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
