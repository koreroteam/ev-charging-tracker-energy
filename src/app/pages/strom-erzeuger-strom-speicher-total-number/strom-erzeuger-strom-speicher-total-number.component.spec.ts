import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StromErzeugerStromSpeicherTotalNumberComponent } from './strom-erzeuger-strom-speicher-total-number.component';

describe('StromErzeugerStromSpeicherTotalNumberComponent', () => {
  let component: StromErzeugerStromSpeicherTotalNumberComponent ;
  let fixture: ComponentFixture<StromErzeugerStromSpeicherTotalNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StromErzeugerStromSpeicherTotalNumberComponent]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StromErzeugerStromSpeicherTotalNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
