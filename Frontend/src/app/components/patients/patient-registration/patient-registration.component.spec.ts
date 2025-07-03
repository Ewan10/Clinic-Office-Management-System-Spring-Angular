import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientRegistrationComponent } from './patient-registration.component';
import { signal } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { PatientsService } from 'src/app/services/patients.service';
import { PatientDetailed } from 'src/app/models/patient-detailed.model';
import { HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

describe('PatientRegistrationComponent', () => {
    let component: PatientRegistrationComponent;
    let fixture: ComponentFixture<PatientRegistrationComponent>;
    let mockModalService: Partial<ModalService>;
    let patientsServiceSpy: jasmine.SpyObj<PatientsService>;

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
            });
        });

        onNotify = jasmine.createSpy('onNotify').and.callFake((message: string, path: string) => {
            this.modalMessage = message;
            this.modalType.set('notify');
        });
    }

    let mockPatient: PatientDetailed = {
        id: 1, firstName: 'Fernando', lastName: 'Echeveria', phoneNumber: '120-349-5503', email: 'fe@mail.es', gender: 'male', healthInsuranceNumber: 2109384903, age: 23, history: '', prescriptions: []
    };


    beforeEach(() => {
        patientsServiceSpy = jasmine.createSpyObj('PatientsService', ['registerPatient']);

        mockModalService = new MockModalService();

        TestBed.configureTestingModule({
            imports: [PatientRegistrationComponent, HttpClientTestingModule],
            providers: [
                { provide: PatientsService, useValue: patientsServiceSpy },
                { provide: ModalService, useValue: mockModalService },
                { provide: ActivatedRoute, useValue: {} },
            ]
        });

        fixture = TestBed.createComponent(PatientRegistrationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should notify success when patient is registered with status 201', () => {
        const httpResponse = new HttpResponse({
            status: 201,
            body: mockPatient
        });
        patientsServiceSpy.registerPatient.and.returnValue(of(httpResponse));
        component.onRegister(mockPatient);

        expect(patientsServiceSpy.registerPatient).toHaveBeenCalledWith(mockPatient);
        expect(mockModalService.onNotify).toHaveBeenCalledWith(
            `Patient: Fernando Echeveria registered successfully.`,
            '/patients'
        );
    });

    it('should notify error when registration fails', () => {
        const errorResponse = { message: 'Registration failed due to server error' };
        patientsServiceSpy.registerPatient.and.returnValue(throwError(() => errorResponse));
        component.onRegister(mockPatient);

        expect(patientsServiceSpy.registerPatient).toHaveBeenCalledWith(mockPatient);
        expect(mockModalService.onNotify).toHaveBeenCalledWith(
            errorResponse.message,
            '/patients'
        );
    });


});