import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StromErzeugerSolarNettoLeistungRatioComponent } from './strom-erzeuger-solar-netto-leistung-ratio.component';


describe('StromErzeugerSolarNettoLeistungComponent t', () => {
  let component: StromErzeugerSolarNettoLeistungRatioComponent ;
  let fixture: ComponentFixture<StromErzeugerSolarNettoLeistungRatioComponent >;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StromErzeugerSolarNettoLeistungRatioComponent  ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StromErzeugerSolarNettoLeistungRatioComponent );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


