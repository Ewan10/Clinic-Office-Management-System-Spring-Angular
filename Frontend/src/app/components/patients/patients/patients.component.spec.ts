import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { PatientsComponent } from './patients.component';
import { PatientsService } from 'src/app/services/patients.service';
import { of, throwError } from 'rxjs';
import { ModalService } from 'src/app/services/modal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { signal } from '@angular/core';
import { PatientBasic } from 'src/app/models/patient-basic.model';
import { PatientDetailed } from 'src/app/models';

describe('PatientsComponent', () => {
    let component: PatientsComponent;
    let fixture: ComponentFixture<PatientsComponent>;
    let patientsServiceSpy: jasmine.SpyObj<PatientsService>;
    let modalService: ModalService;
    let mockPatients: PatientBasic[];
    let routerSpy: jasmine.SpyObj<Router>;

    mockPatients = [
        { id: 1, firstName: 'Fernando', lastName: 'Echeveria', phoneNumber: '120-349-5503', email: 'fe@mail.es', healthInsuranceNumber: 2109384903, age: 23, },
        { id: 2, firstName: 'Miguel', lastName: 'Valeron', phoneNumber: '120-710-203', email: 'miva@mail.es', healthInsuranceNumber: 2294014903, age: 33, }
    ];
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
            });
        });

        onNotify = jasmine.createSpy('onNotify').and.callFake((message: string, path: string) => {
            this.modalMessage = message;
            this.modalType.set('notify');
        });
    }

    patientsServiceSpy = jasmine.createSpyObj('PatientsService', [
        'viewAll',
        'viewPatient',
        'setPatient',
        'deletePatient'
    ]);
    modalService = new MockModalService() as unknown as ModalService;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
        await TestBed.configureTestingModule({
            imports: [PatientsComponent],
            providers: [
                { provide: PatientsService, useValue: patientsServiceSpy },
                { provide: ModalService, useValue: modalService },
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: {} }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PatientsComponent);
        component = fixture.componentInstance;
        patientsServiceSpy.viewAll.and.returnValue(of([]));
        patientsServiceSpy = TestBed.inject(PatientsService) as jasmine.SpyObj<PatientsService>;
        fixture.detectChanges();
    });

    it('should create component', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch patients and update the list on success', () => {
        patientsServiceSpy.viewAll.and.returnValue(of(mockPatients));
        component.onViewAll();

        expect(component.isLoading).toBeFalse();
        expect(component.patients).toEqual(mockPatients);
        expect(patientsServiceSpy.viewAll).toHaveBeenCalled();
    });

    it('should handle error when fetching patients', () => {
        const errorResponse = { message: 'Error fetching patients' };
        patientsServiceSpy.viewAll.and.returnValue(throwError(() => errorResponse));
        component.onViewAll();
        expect(component.isLoading).toBeTrue();
        expect(modalService.onNotify).toHaveBeenCalledWith(`Failed to load the patients: ${errorResponse.message}`, '/');
    });

    it('should navigate to view patient on successful fetch', () => {
        const router = TestBed.inject(Router);
        patientsServiceSpy.viewPatient.and.returnValue(of(mockPatient));
        component.onViewPatient(1);

        expect(patientsServiceSpy.viewPatient).toHaveBeenCalledWith(1);
        expect(patientsServiceSpy.setPatient).toHaveBeenCalledWith(mockPatient);
        expect(router.navigate).toHaveBeenCalledWith(['/patients/view/1']);
    });

    it('should handle error when viewing patient', () => {
        const errorResponse = { message: 'Error viewing patient' };
        patientsServiceSpy.viewPatient.and.returnValue(throwError(() => errorResponse));
        component.onViewPatient(1);
        expect(modalService.onNotify).toHaveBeenCalledWith(`Failed to get the patient: ${errorResponse.message}`, '/patients');
    });

    it('should fetch patient, set it, and navigate to edit page', () => {
        patientsServiceSpy.viewPatient.and.returnValue(of(mockPatient));
        component.onEdit(1);

        expect(patientsServiceSpy.viewPatient).toHaveBeenCalledWith(1);
        expect(patientsServiceSpy.setPatient).toHaveBeenCalledWith(mockPatient);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/patients/edit/1']);
    });

    it('should notify if fetching patient fails', () => {
        const error = { message: 'Not found' };
        patientsServiceSpy.viewPatient.and.returnValue(throwError(() => error));
        component.onEdit(1);

        expect(modalService.onNotify).toHaveBeenCalledWith('Failed to get the patient: Not found', '/patients');
    });

    it('should delete patient and call onNotify on success', fakeAsync(() => {
        component.patients = [...mockPatients];
        (modalService.onConfirm as jasmine.Spy).and.returnValue(Promise.resolve(true));
        patientsServiceSpy.deletePatient.and.returnValue(of('Patient deleted successfully!'));
        component.onDelete(1);
        tick();
        tick();

        expect(patientsServiceSpy.deletePatient).toHaveBeenCalledWith(1);
        expect(modalService.onNotify).toHaveBeenCalledWith(
            'Patient: Fernando Echeveria deleted successfully',
            '/patients'
        );
    }));

    it('should not delete patient when confirmation is false', fakeAsync(() => {
        component.patients = [...mockPatients];
        (modalService.onConfirm as jasmine.Spy).and.callFake(() => Promise.resolve(false));
        patientsServiceSpy.deletePatient.and.returnValue(of('Should not be called'));
        (modalService.onNotify as jasmine.Spy).calls.reset();
        component.onDelete(1);
        tick();
        tick();
        expect(patientsServiceSpy.deletePatient).not.toHaveBeenCalled();
        expect(modalService.onNotify).not.toHaveBeenCalled();
    }));

    it('should notify error if deletePatient errors', fakeAsync(() => {
        component.patients = [...mockPatients];
        (modalService.onConfirm as jasmine.Spy).and.returnValue(Promise.resolve(true));
        const errorResponse = { message: 'Failed to get the patient: Not found' };
        patientsServiceSpy.deletePatient.and.returnValue(throwError(() => errorResponse));
        (modalService.onNotify as jasmine.Spy).calls.reset();
        component.onDelete(1);
        tick();
        tick();
        expect(modalService.onNotify).toHaveBeenCalledWith(
            `Error deleting patient: ${errorResponse.message}`,
            '/patients'
        );
    }));

    it('should not remove patient if deletion not confirmed', fakeAsync(() => {
        component.patients = [...mockPatients];
        (modalService.onConfirm as jasmine.Spy).and.callFake(() => Promise.resolve(false));
        patientsServiceSpy.deletePatient.and.returnValue(of('Should not be called'));
        component.onDelete(1);
        tick();

        const patientStillExists = component.patients.some(p => p.id === 1);
        expect(patientStillExists).toBeTrue();
    }));

});