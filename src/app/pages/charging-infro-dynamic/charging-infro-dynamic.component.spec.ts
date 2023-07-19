import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargingInfroDynamicComponent } from './charging-infro-dynamic.component';

describe('ChargingInfroDynamicComponent', () => {
  let component: ChargingInfroDynamicComponent;
  let fixture: ComponentFixture<ChargingInfroDynamicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargingInfroDynamicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargingInfroDynamicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
