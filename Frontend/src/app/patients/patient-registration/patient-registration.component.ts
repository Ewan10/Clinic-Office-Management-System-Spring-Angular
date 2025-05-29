import { HttpResponse } from "@angular/common/http";
import { Component, inject } from "@angular/core";
import { ModalService } from "src/app/services/modal.service";
import { Patient, PatientsService } from "src/app/services/patients.service";
import { ModalsComponent } from "src/app/shared/modals/modals.component";
import { PatientFormComponent } from "../patient-form/patient-form.component";
import { NgForm } from "@angular/forms";

@Component({
    selector: 'app-patient-registration',
    templateUrl: './patient-registration.component.html',
    styleUrls: ['./patient-registration.component.css'],
    standalone: true,
    imports: [ModalsComponent, PatientFormComponent]
})
export class PatientRegistrationComponent {
    private patientsService = inject(PatientsService);
    modalService = inject(ModalService);

    form: NgForm;
    patient: Patient = {
        id: null,
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        healthInsuranceNumber: null,
        age: null,
        gender: '',
        history: ''
    };

    onRegister(patient) {
        this.patientsService.registerPatient(patient).subscribe(
            (response: HttpResponse<Patient>) => {
                if (response.status === 201) {
                    this.modalService.onNotify(`Patient: ${response.body.firstName} ${response.body.lastName} registered successfully.`,
                        '/patients'
                    );
                }
            },
            (error) => {
                this.modalService.onNotify(error.message,
                    '/patients'
                );
            })
    };
}