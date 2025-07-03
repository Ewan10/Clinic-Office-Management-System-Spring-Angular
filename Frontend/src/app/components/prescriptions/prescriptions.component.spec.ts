import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionsComponent } from './prescriptions.component';
import { PatientsService } from '../../services/patients.service';
import { of, throwError } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { ModalService } from 'src/app/services/modal.service';
import { Prescription } from 'src/app/models/prescription.model';
import { PatientDetailed } from 'src/app/models/patient-detailed.model';
import { signal } from '@angular/core';

describe('PrescriptionsComponent', () => {
  let component: PrescriptionsComponent;
  let fixture: ComponentFixture<PrescriptionsComponent>;
  let patientsServiceSpy: jasmine.SpyObj<PatientsService>;
  let mockModalService: jasmine.SpyObj<ModalService>;

  let mockPrescription = {
    id: null,
    date: '2025-06-01',
    diagnosis: 'Uric acid',
    medicines: ['Zylapour', 'Mucosol']
  };

  let mockPatient: PatientDetailed = {
    id: 1, firstName: 'Fernando', lastName: 'Echeveria', phoneNumber: '120-349-5503', email: 'fe@mail.es', gender: 'male', healthInsuranceNumber: 2109384903, age: 23, history: '', prescriptions: []
  };

  beforeEach(async () => {
    patientsServiceSpy = jasmine.createSpyObj('PatientsService', [
      'createPrescription',
      'viewPatient',
      'setPatient'
    ]);
    mockModalService = jasmine.createSpyObj('ModalService', ['onNotify']);
    (mockModalService as any).modalType = signal<string | null>('info');


    await TestBed.configureTestingModule({
      imports: [PrescriptionsComponent],
      providers: [
        { provide: PatientsService, useValue: patientsServiceSpy },
        { provide: ModalService, useValue: mockModalService }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PrescriptionsComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the form and initialize prescription on open', () => {
    expect(component.showForm).toBeFalse();
    component.toggleForm();
    expect(component.showForm).toBeTrue();
    expect(component.prescription).toEqual({
      id: null,
      date: '',
      diagnosis: '',
      medicines: ['']
    });
  });

  it('should add a new medicine input', () => {
    component.toggleForm();
    component.addMedicine();
    expect(component.prescription.medicines.length).toBe(2);
  });

  it('should update a medicine at given index', () => {
    component.toggleForm();
    component.updateMedicine('Paracetamol', 0);
    expect(component.prescription.medicines[0]).toBe('Paracetamol');
  });

  it('should remove a medicine by index', () => {
    component.toggleForm();
    component.addMedicine(); // now 2 items
    component.removeMedicine(0);
    expect(component.prescription.medicines.length).toBe(1);
  });

  it('should save prescription and notify on success', () => {
    component.toggleForm();
    component.prescription.medicines = ['Med1', ''];
    component.patientId = 1;
    const mockResponse = new HttpResponse<Prescription>({ status: 201, body: {} as Prescription });
    patientsServiceSpy.createPrescription.and.returnValue(of(mockResponse));
    patientsServiceSpy.viewPatient.and.returnValue(of(mockPatient));
    component.savePrescription('2024-01-01', 'Flu');

    expect(patientsServiceSpy.createPrescription).toHaveBeenCalled();
    expect(patientsServiceSpy.viewPatient).toHaveBeenCalledWith(1);
    expect(patientsServiceSpy.setPatient).toHaveBeenCalledWith(mockPatient);
    expect(mockModalService.onNotify).toHaveBeenCalledWith('Prescription saved!', '/patients/view/1');
    expect(component.showForm).toBeFalse();
  });

  it('should notify on prescription creation failure', () => {
    component.toggleForm();
    component.patientId = 1;
    const error = new Error('An unexpected error occurred.');
    patientsServiceSpy.createPrescription.and.returnValue(throwError(() => error));
    component.savePrescription('2024-01-01', 'Covid');
    expect(mockModalService.onNotify).toHaveBeenCalledWith(
      'Failed to submit the prescription: An unexpected error occurred.',
      '/patients/view/1'
    );
  });

});
