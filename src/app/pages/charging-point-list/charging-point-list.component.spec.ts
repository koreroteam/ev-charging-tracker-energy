import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargingPointListComponent } from './charging-point-list.component';

describe('ChargingPointListComponent', () => {
  let component: ChargingPointListComponent;
  let fixture: ComponentFixture<ChargingPointListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargingPointListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargingPointListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
