import { ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { AppointmentsViewComponent } from "./appointments-view.component";
import { Appointment, AppointmentsService } from "src/app/services/appointments.service";
import { ModalService } from "src/app/services/modal.service";
import { Observable, of, throwError } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { signal } from "@angular/core";

describe("AppointmentsViewComponent", () => {
    let component: AppointmentsViewComponent;
    let fixture: ComponentFixture<AppointmentsViewComponent>;
    let appointmentsServiceSpy: Partial<AppointmentsService>;
    let modalServiceSpy: Partial<ModalService>;
    let routerSpy: jasmine.SpyObj<Router>;

    const mockAppointments: Appointment[] = [
        {
            id: 1,
            date: '2025-10-15',
            time: '10:00',
            room: 101,
            doctor: 'Dr Altogarcia',
            patientFirstName: 'Franco',
            patientLastName: 'Villanueva'
        },
        {
            id: 2,
            date: '2025-6-22',
            time: '11:00',
            room: 102,
            doctor: 'Dr Asuncion',
            patientFirstName: 'Ramon',
            patientLastName: 'Reyes'
        }
    ];


    class MockModalService {
        modalType = signal<string | null>(null);
        confirm = signal<boolean | null>(null);
        pendingConfirmation = signal<{ resolve: (value: boolean) => void } | null>(null);
        modalMessage = '';

        onConfirm = jasmine.createSpy('onConfirm').and.callFake((message: string) => {
            return new Promise<boolean>((resolve) => {
                this.modalMessage = message;
                this.confirm.set(true);
                this.modalType.set('confirm');
                this.pendingConfirmation.set({ resolve });
            });
        });

        onNotify = jasmine.createSpy('onNotify').and.callFake((message: string, path: string) => {
            this.modalMessage = message;
            this.modalType.set('notify');
        });
    }
    beforeEach(() => {
        appointmentsServiceSpy = jasmine.createSpyObj<AppointmentsService>('AppointmentsService', ['viewAll', 'deleteAppointment']);
        (appointmentsServiceSpy.viewAll as jasmine.Spy).and.returnValue(of(mockAppointments));
        modalServiceSpy = new MockModalService() as unknown as ModalService;
        routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

        TestBed.configureTestingModule({
            imports: [AppointmentsViewComponent],
            providers: [
                { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
                { provide: AppointmentsService, useValue: appointmentsServiceSpy },
                { provide: ModalService, useValue: modalServiceSpy },
                { provide: Router, useValue: routerSpy }
            ],
        });

        fixture = TestBed.createComponent(AppointmentsViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it('should fetch and sort appointments on initialization', fakeAsync(() => {
        (appointmentsServiceSpy.viewAll as jasmine.Spy).and.returnValue(of(mockAppointments));
        expect(component.appointments.length).toBe(2);
        expect(component.appointments[0].id).toBe(2);
        expect(component.isLoading).toBeFalse();
    }));

    it('should handle error when fetching appointments', () => {
        const mockError = { message: 'Failed to load appointments' };
        (appointmentsServiceSpy.viewAll as jasmine.Spy).and.returnValue(throwError(() => mockError));
        component.ngOnInit();
        expect(modalServiceSpy.onNotify).toHaveBeenCalledWith('Failed to load appointments', '/');
        expect(component.isLoading).toBeFalse();
    })

    it('should navigate to edit page on onEdit()', () => {
        component.onEdit(123);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/appointments/edit/123']);
    });

    it('should remove appointment from list', () => {
        component.appointments = [...mockAppointments];
        component.removeAppointment(component.appointments, 1);
        expect(component.appointments.length).toBe(1);
        expect(component.appointments[0].id).toBe(2);
    });

    it('should delete appointment if user confirms', fakeAsync(() => {
        component.appointments = [...mockAppointments];
        (modalServiceSpy.onConfirm as jasmine.Spy).and.returnValue(Promise.resolve(true));
        (appointmentsServiceSpy.deleteAppointment as jasmine.Spy).and.returnValue(of({}));
        component.onDelete(1);
        tick();
        tick();
        expect(appointmentsServiceSpy.deleteAppointment).toHaveBeenCalledWith(1);
        expect(modalServiceSpy.onNotify).toHaveBeenCalledWith(
            'Appointment for Mr/Mrs Franco Villanueva deleted successfully!',
            '/appointments'
        );
        expect(component.appointments.length).toBe(1);
    }));

    it('should not delete appointment if user cancels', fakeAsync(() => {
        component.appointments = [mockAppointments[0]];
        (modalServiceSpy.onConfirm as jasmine.Spy).and.returnValue(Promise.resolve(false));
        component.onDelete(1);
        tick();
        expect(appointmentsServiceSpy.deleteAppointment).not.toHaveBeenCalled();
        expect(modalServiceSpy.onNotify).not.toHaveBeenCalled();
    }));


    it('should notify on delete error', fakeAsync(() => {
        component.appointments = [mockAppointments[0]];
        (modalServiceSpy.onConfirm as jasmine.Spy).and.returnValue(Promise.resolve(true));
        (appointmentsServiceSpy.deleteAppointment as jasmine.Spy).and.returnValue(throwError(() => new Error('Delete failed')));
        component.onDelete(1);
        tick();
        tick();
        expect(modalServiceSpy.onNotify).toHaveBeenCalledWith('Delete failed', '/appointments');
    }));


});