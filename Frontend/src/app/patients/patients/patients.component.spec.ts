import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientsComponent } from './patients.component';
import { PatientsService } from 'src/app/services/patients.service';
import { of } from 'rxjs';
import { ModalService } from 'src/app/services/modal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { signal } from '@angular/core';

describe('PatientsComponent', () => {
    let component: PatientsComponent;
    let fixture: ComponentFixture<PatientsComponent>;
    let patientsServiceSpy: jasmine.SpyObj<PatientsService>;
    let modalServiceSpy: jasmine.SpyObj<ModalService>;
    let mockModalService: Partial<ModalService>;

    beforeEach(async () => {
        patientsServiceSpy = jasmine.createSpyObj('PatientsService', [
            'viewAll',
            'viewPatient',
            'setPatient',
            'deletePatient'
        ]);

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

        await TestBed.configureTestingModule({
            imports: [PatientsComponent],
            providers: [
                { provide: PatientsService, useValue: patientsServiceSpy },
                { provide: ModalService, useValue: mockModalService },
                { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']) },
                { provide: ActivatedRoute, useValue: {} }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PatientsComponent);
        component = fixture.componentInstance;
        patientsServiceSpy.viewAll.and.returnValue(of([]));

        patientsServiceSpy = TestBed.inject(PatientsService) as jasmine.SpyObj<PatientsService>;
        modalServiceSpy = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;

        fixture.detectChanges();
    });

    it('should create component', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch patients and update the list on success', () => {
        const mockPatients = [{ id: 1, firstName: 'Fernando', lastName: 'Echeveria', phoneNumber: '120-349-5503', email: 'fe@mail.es', healthInsuranceNumber: 2109384903, age: 23, },
        { id: 2, firstName: 'Miguel', lastName: 'Valeron', phoneNumber: '120-710-203', email: 'miva@mail.es', healthInsuranceNumber: 2294014903, age: 33, }
        ];
        patientsServiceSpy.viewAll.and.returnValue(of(mockPatients));

        component.onViewAll();

        expect(component.isLoading).toBeFalse();
        expect(component.patients).toEqual(mockPatients);
        expect(patientsServiceSpy.viewAll).toHaveBeenCalled();
    })

});