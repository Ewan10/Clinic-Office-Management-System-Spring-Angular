import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientViewComponent } from './patient-view.component';
import { PatientsService } from 'src/app/services/patients.service';
import { BehaviorSubject, of } from 'rxjs';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { PatientDetailed } from 'src/app/models';

describe('PatientViewComponent', () => {
  let component: PatientViewComponent;
  let fixture: ComponentFixture<PatientViewComponent>;
  let patientsServiceSpy: jasmine.SpyObj<PatientsService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockActivatedRoute = {
    snapshot: {
      paramMap: convertToParamMap({ id: '1' })
    }
  };

  const mockPatient: PatientDetailed = {
    id: 1,
    firstName: 'Test',
    lastName: 'Patient',
    age: 30,
    gender: 'male',
    email: 'test@patient.com',
    phoneNumber: '123-456-7890',
    healthInsuranceNumber: 1234567890,
    history: '',
    prescriptions: []
  };

  beforeEach(async () => {
    patientsServiceSpy = jasmine.createSpyObj('PatientsService', ['setPatient', 'getPatient'], {
      patients$: new BehaviorSubject<PatientDetailed | null>(mockPatient)
    });

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [PatientViewComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: PatientsService, useValue: patientsServiceSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set patient when patients$ emits a value', () => {
    (patientsServiceSpy.patients$ as BehaviorSubject<PatientDetailed | null>).next(mockPatient);
    fixture.detectChanges();
    expect(component.patient).toEqual(mockPatient);
  });

  it('should navigate to /patients if patient is null', () => {
    (patientsServiceSpy.patients$ as BehaviorSubject<PatientDetailed | null>).next(null);
    fixture.detectChanges();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/patients']);
  });

  it('should toggle showPrescriptions', () => {
    expect(component.showPrescriptions).toBeFalse();
    component.togglePrescriptions();
    expect(component.showPrescriptions).toBeTrue();
    component.togglePrescriptions();
    expect(component.showPrescriptions).toBeFalse();
  });



});
