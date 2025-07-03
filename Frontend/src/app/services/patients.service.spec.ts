import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PatientsService } from './patients.service';
import { PatientDetailed } from '../models/patient-detailed.model';
import { skip } from 'rxjs/operators';
import { User } from '../models/user.model';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from './authentication.service';
import { ErrorHandlerService } from './error-handler.service';
import { of, throwError } from 'rxjs';
import { PatientBasic } from '../models/patient-basic.model';
import { Prescription } from '../models/prescription.model';

describe('PatientsService', () => {
    let patientsService: PatientsService;
    let httpMock: HttpTestingController;
    let authServiceSpy: jasmine.SpyObj<AuthenticationService>;
    let errorHandlerSpy: jasmine.SpyObj<ErrorHandlerService>;
    const testToken = 'validtoken';
    let mockPatient: PatientDetailed = {
        id: 1, firstName: 'Fernando', lastName: 'Echeveria', phoneNumber: '120-349-5503', email: 'fe@mail.es', gender: 'male', healthInsuranceNumber: 2109384903, age: 23, history: '', prescriptions: []
    };
    let mockPatientBasic: PatientBasic = {
        id: 1, firstName: 'Fernando', lastName: 'Echeveria', phoneNumber: '120-349-5503', email: 'fe@mail.es', healthInsuranceNumber: 2109384903, age: 23,
    };
    const mockUser = new User(new Date(Date.now() + 3600000), 'testuser', 'validtoken');

    beforeEach(() => {
        authServiceSpy = jasmine.createSpyObj('AuthenticationService', [], {
            user: of(mockUser)
        });

        errorHandlerSpy = jasmine.createSpyObj('ErrorHandlerService', ['handleError']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                PatientsService,
                { provide: AuthenticationService, useValue: authServiceSpy },
                { provide: ErrorHandlerService, useValue: errorHandlerSpy }
            ]
        });
        patientsService = TestBed.inject(PatientsService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(patientsService).toBeTruthy();
    });

    it('should set patient and emit via subject', (done) => {
        patientsService.patients$.pipe(skip(1)).subscribe((patient) => {
            expect(patient).toEqual(mockPatient);
            done();
        });
        patientsService.setPatient(mockPatient);
    });

    it('should return the patient via getPatient()', () => {
        patientsService.setPatient(mockPatient);
        const result = patientsService.getPatient();
        expect(result).toEqual(mockPatient);
    });

    it('should initially return null from getPatient()', () => {
        expect(patientsService.getPatient()).toBeNull();
    });

    it('should send POST request to register patient', () => {
        patientsService.registerPatient(mockPatient).subscribe(response => {
            expect(response.body).toEqual(mockPatient);
        });
        const req = httpMock.expectOne(`${patientsService.url}/patients/register`);
        expect(req.request.method).toBe('POST');
        expect(req.request.headers.get('Authorization')).toBe('Bearer validtoken');
        req.flush(mockPatient, { status: 200, statusText: 'OK' });
    });

    it('should handle error when registering a patient', () => {
        errorHandlerSpy.handleError.and.returnValue(throwError(() => new Error('Patient registration failed')));
        patientsService.registerPatient(mockPatient).subscribe({
            error: (err) => {
                expect(errorHandlerSpy.handleError).toHaveBeenCalled();
                expect(err.message).toBe('Patient registration failed');
            }
        });
        const req = httpMock.expectOne(`${patientsService.url}/patients/register`);
        req.error(new ProgressEvent('Network error'));
    });

    it('should fetch all patients', () => {
        const backendResponse = {
            '1': mockPatientBasic
        };
        patientsService.viewAll().subscribe(patients => {
            expect(patients.length).toBe(1);
            expect(patients[0].firstName).toBe('Fernando');
        });
        const req = httpMock.expectOne(`${patientsService.url}/patients`);
        expect(req.request.method).toBe('GET');
        req.flush(backendResponse);
    });

    it('should handle error when fetching all patients', () => {
        errorHandlerSpy.handleError.and.returnValue(throwError(() => new Error('Fetching patients failed')));
        patientsService.viewAll().subscribe({
            error: (err) => {
                expect(errorHandlerSpy.handleError).toHaveBeenCalled();
                expect(err.message).toBe('Fetching patients failed');
            }
        });
        const req = httpMock.expectOne(`${patientsService.url}/patients`);
        req.error(new ProgressEvent('Network error'));
    });

    it('should fetch a single patient by ID', () => {
        patientsService.viewPatient(1).subscribe(patient => {
            expect(patient).toEqual(mockPatient);
        });
        const req = httpMock.expectOne(`${patientsService.url}/patients/view/1`);
        expect(req.request.method).toBe('GET');
        req.flush(mockPatient);
    });

    it('should handle error when fetching a patient by ID', () => {
        errorHandlerSpy.handleError.and.returnValue(throwError(() => new Error('fetching patient failed')));
        patientsService.viewPatient(1).subscribe({
            error: (error) => {
                expect(errorHandlerSpy.handleError).toHaveBeenCalled();
                expect(error.message).toBe('fetching patient failed');
            }
        });
        const req = httpMock.expectOne(`${patientsService.url}/patients/view/1`);
        req.error(new ProgressEvent('Network error'));
    });

    it('should update a patient', () => {
        patientsService.updatePatient(mockPatient).subscribe(response => {
            expect(response.body).toEqual(mockPatient);
        });
        const req = httpMock.expectOne(`${patientsService.url}/patients/edit/1`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.headers.get('Authorization')).toBe(`Bearer ${testToken}`);
        req.flush(mockPatient, { status: 200, statusText: 'OK' });
    });

    it('should handle error when updating a patient', () => {
        errorHandlerSpy.handleError.and.returnValue(throwError(() => new Error('Updating patient details failed')));
        patientsService.updatePatient(mockPatient).subscribe({
            error: (err) => {
                expect(errorHandlerSpy.handleError).toHaveBeenCalled();
                expect(err.message).toBe('Updating patient details failed');
            }
        });
        const req = httpMock.expectOne(`${patientsService.url}/patients/edit/1`);
        req.error(new ProgressEvent('Network error'));
    });

    it('should create a prescription', () => {
        const prescription = { date: '20024-04-23', diagnosis: '', medicines: ['TestMed'] };
        const response: Prescription = { id: 1, ...prescription };
        patientsService.createPrescription(1, prescription).subscribe(res => {
            expect(res.body).toEqual(response);
        });
        const req = httpMock.expectOne(`${patientsService.url}/patients/view/1/prescriptions`);
        expect(req.request.method).toBe('POST');
        req.flush(response);
    });

    it('should handle error when creating a prescription', () => {
        errorHandlerSpy.handleError.and.returnValue(throwError(() => new Error('Saving prescription failed')));
        const prescription = { date: '20024-04-23', diagnosis: '', medicines: ['TestMed'] };
        patientsService.createPrescription(1, prescription).subscribe({
            error: (err) => {
                expect(errorHandlerSpy.handleError).toHaveBeenCalled();
                expect(err.message).toBe('Saving prescription failed');
            }
        });
        const req = httpMock.expectOne(`${patientsService.url}/patients/view/1/prescriptions`);
        req.error(new ProgressEvent('Network error'));
    });


    it('should delete a patient', () => {
        patientsService.deletePatient(1).subscribe(res => {
            expect(res).toBe('deleted');
        });
        const req = httpMock.expectOne(`${patientsService.url}/patients/1`);
        expect(req.request.method).toBe('DELETE');
        req.flush('deleted');
    });

    it('should handle error when deleting a patient', () => {
        errorHandlerSpy.handleError.and.returnValue(throwError(() => new Error('Deleting patient failed')));
        patientsService.deletePatient(1).subscribe({
            error: (err) => {
                expect(errorHandlerSpy.handleError).toHaveBeenCalled();
                expect(err.message).toBe('Deleting patient failed');
            }
        });
        const req = httpMock.expectOne(`${patientsService.url}/patients/1`);
        req.error(new ProgressEvent('Network error'));
    });

});