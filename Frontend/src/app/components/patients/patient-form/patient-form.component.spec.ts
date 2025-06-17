import { ComponentFixture, TestBed } from "@angular/core/testing";
import { PatientFormComponent } from "./patient-form.component";
import { ActivatedRoute } from "@angular/router";

describe("PatientFormComponent", () => {
    let component: PatientFormComponent;
    let fixture: ComponentFixture<PatientFormComponent>;

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
});