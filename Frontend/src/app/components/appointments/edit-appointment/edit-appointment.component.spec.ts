import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAppointmentsComponent } from './edit-appointments.component';
import { ActivatedRoute } from '@angular/router';
import { ModalService } from 'src/app/services/modal.service';
import { Appointment, AppointmentsService } from 'src/app/services/appointments.service';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

describe('EditAppointmentsComponent', () => {
    let component: EditAppointmentsComponent;
    let fixture: ComponentFixture<EditAppointmentsComponent>;
    let mockModalService: ModalService;
    let appointmentsServiceSpy: jasmine.SpyObj<AppointmentsService>;

    const mockAppointment: Appointment = {
        id: 1,
        date: '2023-10-01',
        time: '10:00',
        room: 101,
        doctor: 'Dr Altogarcia',
        patientFirstName: 'Franco',
        patientLastName: 'Villanueva'
    };

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
        appointmentsServiceSpy = jasmine.createSpyObj('AppointmentsService', [
            'viewAll',
            'viewAppointment',
            'updateAppointment'
        ]);

        appointmentsServiceSpy.viewAppointment.and.returnValue(of(mockAppointment));
        appointmentsServiceSpy.updateAppointment.and.returnValue(of(new HttpResponse({ status: 200, body: mockAppointment }))
        );
        appointmentsServiceSpy.viewAll.and.returnValue(of([]));
        mockModalService = new MockModalService() as unknown as ModalService;

        TestBed.configureTestingModule({
            imports: [EditAppointmentsComponent],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: {
                                get: (key: string) => 1
                            }
                        }
                    }
                },
                { provide: ModalService, useValue: mockModalService },
                { provide: AppointmentsService, useValue: appointmentsServiceSpy }
            ]
        });

        fixture = TestBed.createComponent(EditAppointmentsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch appointment on init', () => {
        component.ngOnInit();
        expect(appointmentsServiceSpy.viewAppointment).toHaveBeenCalledWith(1);
        expect(component.appointment).toEqual(mockAppointment);
    });

    it('should notify on error when fetching appointment fails', () => {
        const error = { message: 'Not found' };
        appointmentsServiceSpy.viewAppointment.and.returnValue(throwError(() => error));
        component.ngOnInit();
        expect(mockModalService.onNotify).toHaveBeenCalledWith(error.message, '/appointments');
    });

    it('should update appointment and notify success', () => {
        component.appointment = mockAppointment;
        component.onSubmit(mockAppointment);
        expect(appointmentsServiceSpy.updateAppointment).toHaveBeenCalledWith(mockAppointment);
        expect(mockModalService.onNotify).toHaveBeenCalledWith(
            `Appointment: ${mockAppointment.id} updated successfully!`,
            '/appointments'
        );
    });

    it('should notify on error when updating appointment fails', () => {
        const error = { message: 'Update failed' };
        appointmentsServiceSpy.updateAppointment.and.returnValue(throwError(() => error));
        component.onSubmit(mockAppointment);
        expect(mockModalService.onNotify).toHaveBeenCalledWith(error.message, '/appointments');
    });

});
