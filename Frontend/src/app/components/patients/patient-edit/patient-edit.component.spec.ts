import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientEditComponent } from './patient-edit.component';
import { PatientsService } from 'src/app/services/patients.service';
import { of, throwError } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { ModalService } from 'src/app/services/modal.service';
import { PatientDetailed } from 'src/app/models/patient-detailed.model';
import { signal } from '@angular/core';

describe('PatientEditComponent', () => {
  let component: PatientEditComponent;
  let fixture: ComponentFixture<PatientEditComponent>;
  let patientsServiceSpy: jasmine.SpyObj<PatientsService>;
  let mockModalService: ModalService;

  const mockActivatedRoute = {
    snapshot: {
      paramMap: convertToParamMap({ id: '1' })
    }
  };

  let mockPatient: PatientDetailed = {
    id: 1, firstName: 'Fernando', lastName: 'Echeveria', phoneNumber: '120-349-5503', email: 'fe@mail.es', gender: 'male', healthInsuranceNumber: 2109384903, age: 23, history: '', prescriptions: []
  };

  class MockModalService {
    modalType = signal<string | null>(null);
    confirm = signal<boolean | null>(null);
    pendingConfirmation = signal<{ resolve: (value: boolean) => void } | null>(null);
    modalMessage = '';
    confirmResponse: boolean = true;

    onConfirm = jasmine.createSpy('onConfirm').and.callFake((message: string) => {
      return new Promise<boolean>((resolve) => {
        this.modalMessage = message;
        this.confirm.set(this.confirmResponse);
        this.modalType.set('confirm');
        this.pendingConfirmation.set({ resolve });
        this.pendingConfirmation.set({ resolve });
      });
    });

    onNotify = jasmine.createSpy('onNotify').and.callFake((message: string, path: string) => {
      this.modalMessage = message;
      this.modalType.set('notify');
    });
  }
  mockModalService = new MockModalService() as unknown as ModalService;

  beforeEach(async () => {
    patientsServiceSpy = jasmine.createSpyObj('PatientsService', ['viewPatient', 'updatePatient']);


    await TestBed.configureTestingModule({
      imports: [PatientEditComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: PatientsService, useValue: patientsServiceSpy },
        { provide: ModalService, useValue: mockModalService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientEditComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load patient on ngOnInit when viewPatient succeeds', () => {
    patientsServiceSpy.viewPatient.and.returnValue(of(mockPatient));
    component.ngOnInit();
    expect(patientsServiceSpy.viewPatient).toHaveBeenCalledWith(1);
    expect(component.patient).toEqual(mockPatient);
  });


  it('should notify with error when viewPatient fails', () => {
    const errorResponse = new Error('Couldn\'t fetch patient data');
    patientsServiceSpy.viewPatient.and.returnValue(throwError(() => errorResponse));
    fixture.detectChanges();
    expect(mockModalService.onNotify).toHaveBeenCalledWith('Couldn\'t fetch patient data', '/patients');
  });

  it('should notify success when updatePatient returns 200', () => {
    const httpResponse = new HttpResponse({ status: 200, body: mockPatient });
    patientsServiceSpy.updatePatient.and.returnValue(of(httpResponse));
    component.onEdit(mockPatient);

    expect(patientsServiceSpy.updatePatient).toHaveBeenCalledWith(mockPatient);
    expect(mockModalService.onNotify).toHaveBeenCalledWith(
      `Patient: Fernando Echeveria updated successfully!`,
      '/patients'
    );
  });

  it('should notify error if updatePatient fails', () => {
    const errorMessage = 'Update failed';
    patientsServiceSpy.updatePatient.and.returnValue(throwError(() => new Error(errorMessage)));
    component.onEdit(mockPatient);
    expect(mockModalService.onNotify).toHaveBeenCalledWith(errorMessage, '/patients');
  });

});
