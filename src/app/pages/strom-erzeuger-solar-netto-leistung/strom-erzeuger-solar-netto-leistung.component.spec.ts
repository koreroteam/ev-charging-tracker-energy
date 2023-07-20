import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StromErzeugerSolarNettoLeistungComponent } from './strom-erzeuger-solar-netto-leistung.component';


describe('StromErzeugerSolarNettoLeistungComponent t', () => {
  let component: StromErzeugerSolarNettoLeistungComponent ;
  let fixture: ComponentFixture<StromErzeugerSolarNettoLeistungComponent >;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StromErzeugerSolarNettoLeistungComponent  ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StromErzeugerSolarNettoLeistungComponent );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

