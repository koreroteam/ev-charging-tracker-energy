import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargingInfraPointMapComponent } from './charging-infra-point-map.component';

describe('ChargingInfraPointMapComponent', () => {
  let component: ChargingInfraPointMapComponent;
  let fixture: ComponentFixture<ChargingInfraPointMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargingInfraPointMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargingInfraPointMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
