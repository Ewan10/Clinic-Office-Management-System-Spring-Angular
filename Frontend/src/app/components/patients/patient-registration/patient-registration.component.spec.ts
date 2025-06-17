import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientRegistrationComponent } from './patient-registration.component';
import { signal } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';

describe('PatientRegistrationComponent', () => {
    let component: PatientRegistrationComponent;
    let fixture: ComponentFixture<PatientRegistrationComponent>;
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
            imports: [PatientRegistrationComponent, HttpClientTestingModule],
            providers: [
                { provide: 'PatientsService', useValue: jasmine.createSpyObj('PatientsService', ['registerPatient']) },
                { provide: 'ModalService', useValue: mockModalService },
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
});