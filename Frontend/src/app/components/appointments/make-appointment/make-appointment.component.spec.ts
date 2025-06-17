import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { MakeAppointmentComponent } from './make-appointment.component';
import { ActivatedRoute } from '@angular/router';
import { ModalService } from 'src/app/services/modal.service';
import { signal } from '@angular/core';

describe('MakeAppointmentComponent', () => {
    let component: MakeAppointmentComponent;
    let fixture: ComponentFixture<MakeAppointmentComponent>;
    let mockModalService: Partial<ModalService>;

    beforeEach(() => {

        const mockModalType = signal<string | null>(null);
        const mockConfirm = signal<boolean | null>(null);
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
            imports: [MakeAppointmentComponent, HttpClientTestingModule],
            providers: [
                { provide: 'AppointmentsService', useValue: jasmine.createSpyObj('AppointmentsService', ['registerAppointment']) },
                { provide: ActivatedRoute, useValue: {} },
                { provide: 'ModalService', useValue: mockModalService }
            ]
        });
        fixture = TestBed.createComponent(MakeAppointmentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});