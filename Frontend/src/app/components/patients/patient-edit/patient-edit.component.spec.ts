import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientEditComponent } from './patient-edit.component';
import { PatientsService } from 'src/app/services/patients.service';
import { of, throwError } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { ModalService } from 'src/app/services/modal.service';

describe('PatientEditComponent', () => {
  let component: PatientEditComponent;
  let fixture: ComponentFixture<PatientEditComponent>;
  let patientsServiceSpy: jasmine.SpyObj<PatientsService>;
  let modalServiceSpy: jasmine.SpyObj<ModalService>;

  const mockActivatedRoute = {
    snapshot: {
      paramMap: convertToParamMap({ id: '1' })
    }
  };

  beforeEach(async () => {
    patientsServiceSpy = jasmine.createSpyObj('PatientsService', ['viewPatient', 'updatePatient']);
    const modalTypeSpy = jasmine.createSpy('modalType') as any;
    modalTypeSpy.set = jasmine.createSpy('modalType.set');

    modalServiceSpy = {
      onNotify: jasmine.createSpy('onNotify'),
      modalType: modalTypeSpy
    } as unknown as jasmine.SpyObj<ModalService>;

    await TestBed.configureTestingModule({
      imports: [PatientEditComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: PatientsService, useValue: patientsServiceSpy },
        { provide: ModalService, useValue: modalServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientEditComponent);
    component = fixture.componentInstance;
    patientsServiceSpy = TestBed.inject(PatientsService) as jasmine.SpyObj<PatientsService>;

    patientsServiceSpy.updatePatient.and.returnValue(of(new HttpResponse({
      body: {
        id: 1, firstName: 'Fernando', lastName: 'Echeveria',
        phoneNumber: '120-349-5503', email: 'fe@mail.es',
        healthInsuranceNumber: 2109384903, age: 23, gender: 'male',
        history: '', prescriptions: []
      },
      status: 200
    })
    )
    );

    patientsServiceSpy.viewPatient.and.returnValue(of({
      id: 1,
      firstName: 'Fernando',
      lastName: 'Echeveria',
      phoneNumber: '120-349-5503',
      email: 'fe@mail.es',
      healthInsuranceNumber: 2109384903,
      age: 23,
      gender: 'male',
      history: '',
      prescriptions: []
    }));


    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call modalService.onNotify when viewPatient fails', () => {
    const errorResponse = new Error('some error message');
    patientsServiceSpy.viewPatient.and.returnValue(throwError(() => errorResponse));
    component.ngOnInit();
    fixture.detectChanges();
    expect(modalServiceSpy.onNotify).toHaveBeenCalledWith('some error message', '/patients');
  });

});
