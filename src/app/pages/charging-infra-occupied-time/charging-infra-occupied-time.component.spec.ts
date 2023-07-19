import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargingInfraOccupiedTimeComponent } from './charging-infra-occupied-time.component';

describe('ChargingInfraOccupiedTimeComponent', () => {
  let component: ChargingInfraOccupiedTimeComponent;
  let fixture: ComponentFixture<ChargingInfraOccupiedTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChargingInfraOccupiedTimeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargingInfraOccupiedTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
