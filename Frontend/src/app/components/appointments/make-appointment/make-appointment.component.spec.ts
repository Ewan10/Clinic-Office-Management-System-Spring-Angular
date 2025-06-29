import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { MakeAppointmentComponent } from './make-appointment.component';
import { ActivatedRoute } from '@angular/router';
import { ModalService } from 'src/app/services/modal.service';
import { signal } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Appointment, AppointmentsService } from 'src/app/services/appointments.service';
import { of, throwError } from 'rxjs';

describe('MakeAppointmentComponent', () => {
    let component: MakeAppointmentComponent;
    let fixture: ComponentFixture<MakeAppointmentComponent>;
    let mockModalService: ModalService;
    let appointmentsService: jasmine.SpyObj<AppointmentsService>;

    const mockAppointment: Appointment = {
        id: 1,
        date: '2023-10-01',
        time: '10:00',
        room: 101,
        doctor: 'DR Altogarcia',
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
        appointmentsService = jasmine.createSpyObj('AppointmentsService', [
            'registerAppointment',
            'viewAll'
        ]);
        appointmentsService.viewAll.and.returnValue(of([]));
        mockModalService = new MockModalService() as unknown as ModalService;
        TestBed.configureTestingModule({
            imports: [MakeAppointmentComponent, HttpClientTestingModule],
            providers: [
                { provide: AppointmentsService, useValue: appointmentsService },
                { provide: ActivatedRoute, useValue: {} },
                { provide: ModalService, useValue: mockModalService }
            ]
        });
        fixture = TestBed.createComponent(MakeAppointmentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });


    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call registerAppointment with form data on submit', () => {
        appointmentsService.registerAppointment
            .and.returnValue(of(new HttpResponse({ status: 201, body: mockAppointment })));

        component.onSubmit(mockAppointment);
        expect(appointmentsService.registerAppointment).toHaveBeenCalledWith(mockAppointment);
    });

    it('should notify modalService with success message when appointment is created', fakeAsync(() => {
        appointmentsService.registerAppointment
            .and.returnValue(of(new HttpResponse({ status: 201, body: mockAppointment })));

        component.onSubmit(mockAppointment);
        tick();
        expect(mockModalService.onNotify).toHaveBeenCalledWith('Appointment created successfully!', '/appointments');
    }));

    it('should notify modalService with error message when registration fails', fakeAsync(() => {
        appointmentsService.registerAppointment
            .and.returnValue(throwError(() => new Error('Failed')));

        component.onSubmit(mockAppointment);
        tick();
        expect(mockModalService.onNotify).toHaveBeenCalledWith('Failed', '/appointments');
    }));

});