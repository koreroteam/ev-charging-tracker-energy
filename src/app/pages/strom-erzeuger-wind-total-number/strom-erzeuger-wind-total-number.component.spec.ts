import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StromErzeugerWindTotalNumberComponent} from './strom-erzeuger-wind-total-number.component';

describe('StromErzeugerWindTotalNumberComponent', () => {
  let component: StromErzeugerWindTotalNumberComponent ;
  let fixture: ComponentFixture<StromErzeugerWindTotalNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StromErzeugerWindTotalNumberComponent]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StromErzeugerWindTotalNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
