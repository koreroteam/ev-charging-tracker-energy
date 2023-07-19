import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargingInfraPointMapLiveComponent } from './charging-infra-point-map-live.component';

describe('ChargingInfraPointMapLiveComponent', () => {
  let component: ChargingInfraPointMapLiveComponent;
  let fixture: ComponentFixture<ChargingInfraPointMapLiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargingInfraPointMapLiveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargingInfraPointMapLiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
