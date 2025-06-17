import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppointmentsViewComponent } from "./appointments-view.component";
import { AppointmentsService } from "src/app/services/appointments.service";
import { ModalService } from "src/app/services/modal.service";
import { of } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { signal } from "@angular/core";

describe("AppointmentsViewComponent", () => {
    let component: AppointmentsViewComponent;
    let fixture: ComponentFixture<AppointmentsViewComponent>;
    let mockAppointmentsService: Partial<AppointmentsService>;
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
        mockAppointmentsService = jasmine.createSpyObj('AppointmentsService', ['viewAll', 'deleteAppointment']);
        (mockAppointmentsService.viewAll as jasmine.Spy).and.returnValue(of([]));
        (mockAppointmentsService.deleteAppointment as jasmine.Spy).and.returnValue(of({}));

        TestBed.configureTestingModule({
            imports: [AppointmentsViewComponent],
            providers: [
                { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
                { provide: AppointmentsService, useValue: mockAppointmentsService },
                { provide: ModalService, useValue: mockModalService }
            ],
        });

        fixture = TestBed.createComponent(AppointmentsViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});