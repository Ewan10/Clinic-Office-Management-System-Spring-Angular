import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAppointmentsComponent } from './edit-appointments.component';
import { ActivatedRoute } from '@angular/router';
import { ModalService } from 'src/app/services/modal.service';
import { Appointment, AppointmentsService } from 'src/app/services/appointments.service';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

describe('EditAppointmentsComponent', () => {
    let component: EditAppointmentsComponent;
    let fixture: ComponentFixture<EditAppointmentsComponent>;
    let mockModalService: Partial<ModalService>;

    beforeEach(() => {
        const mockModalType = signal<string | null>(null);
        const mockConfirm = signal<boolean | null>(null);
        const appointmentsServiceSpy = jasmine.createSpyObj('AppointmentsService', ['viewAll', 'viewAppointment', 'updateAppointment']);

        appointmentsServiceSpy.viewAll.and.returnValue(of([]));
        appointmentsServiceSpy.viewAppointment.and.returnValue(of({
            id: 1,
            date: '2025-06-20',
            time: '10:00',
            room: 101,
            doctor: 'Dr. Smith',
            patientFirstName: 'John',
            patientLastName: 'Doe'
        }));

        appointmentsServiceSpy.updateAppointment.and.returnValue(of(new HttpResponse<Appointment>({
            body: {
                id: 1,
                date: '2025-06-20',
                time: '10:00',
                room: 101,
                doctor: 'Dr. Smith',
                patientFirstName: 'John',
                patientLastName: 'Doe'
            },
            status: 200
        })));

        const mockPendingConfirmation = signal<{
            resolve: (value: boolean) => void;
        } | null>(null);

        mockModalService = {
            modalType: mockModalType,
            confirm: mockConfirm,
            pendingConfirmation: mockPendingConfirmation,
            modalMessage: '',
            onConfirm: jasmine.createSpy('onConfirm').and.returnValue(Promise.resolve(true)),
            onNotify: jasmine.createSpy('onNotify')
        };

        TestBed.configureTestingModule({
            imports: [EditAppointmentsComponent],
            providers: [
                {
                    provide: ActivatedRoute, useValue: {
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
});
