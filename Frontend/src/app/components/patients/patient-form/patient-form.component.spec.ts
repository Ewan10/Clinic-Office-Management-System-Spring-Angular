import { ComponentFixture, TestBed } from "@angular/core/testing";
import { PatientFormComponent } from "./patient-form.component";
import { ActivatedRoute } from "@angular/router";
import { PatientDetailed } from "src/app/models/patient-detailed.model";
import { NgForm } from "@angular/forms";

describe("PatientFormComponent", () => {
    let component: PatientFormComponent;
    let fixture: ComponentFixture<PatientFormComponent>;
    let mockPatient: PatientDetailed = {
        id: 1, firstName: 'Fernando', lastName: 'Echeveria', phoneNumber: '120-349-5503', email: 'fe@mail.es', gender: 'male', healthInsuranceNumber: 2109384903, age: 23, history: '', prescriptions: []
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [PatientFormComponent],
            providers: [
                { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
            ]
        });

        fixture = TestBed.createComponent(PatientFormComponent);
        component = fixture.componentInstance;
        component.patient = {
            id: 1,
            firstName: 'Fernando',
            lastName: 'Echeveria',
            phoneNumber: '120-349-5503',
            email: 'fe@mail.es',
            healthInsuranceNumber: 2109384903,
            age: 23,
            gender: 'male',
            history: '',
            prescriptions: []
        }
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it('should emit formSubmit with patient data including id on submit (edit mode)', () => {
        component.patient = mockPatient;
        spyOn(component.formSubmit, 'emit');
        fixture.detectChanges();

        const dummyForm = {
            value: {
                firstName: 'Alice',
                lastName: 'Fernandez',
                phoneNumber: '1234567890',
                email: 'alice@example.com',
                gender: 'female',
                healthInsuranceNumber: 1234567890,
                age: 30,
                history: 'Updated history'
            },
            valid: true
        } as NgForm;

        component.onSubmit(dummyForm);
        expect(component.formSubmit.emit).toHaveBeenCalledWith(jasmine.objectContaining({
            id: 1,
            firstName: 'Alice',
            lastName: 'Fernandez',
            phoneNumber: '1234567890',
            email: 'alice@example.com',
            gender: 'female',
            healthInsuranceNumber: 1234567890,
            history: 'Updated history'
        }));
    });

    it('should not emit if form is invalid', () => {
        component.patient = mockPatient;
        spyOn(component.formSubmit, 'emit');
        const invalidForm = {
            value: {},
            valid: false,
            invalid: true
        } as NgForm;
        component.onSubmit(invalidForm);
        expect(component.formSubmit.emit).not.toHaveBeenCalled();
    });

    it('should emit formSubmit without id if patient has no id (create mode)', () => {
        const newPatient = { ...mockPatient };
        delete newPatient.id;
        component.patient = newPatient;
        spyOn(component.formSubmit, 'emit');
        fixture.detectChanges();

        const dummyForm = {
            value: {
                firstName: 'Bob',
                lastName: 'Smith',
                phoneNumber: '0987654321',
                email: 'bob@example.com',
                gender: 'male',
                healthInsuranceNumber: 9876543210,
                age: 40,
                history: 'N/A'
            },
            valid: true
        } as NgForm;
        component.onSubmit(dummyForm);
        expect(component.formSubmit.emit).toHaveBeenCalledWith(jasmine.objectContaining({
            firstName: 'Bob',
            lastName: 'Smith',
            phoneNumber: '0987654321',
            email: 'bob@example.com',
            gender: 'male',
            healthInsuranceNumber: 9876543210,
            age: 40,
            history: 'N/A'
        }));
    });

});