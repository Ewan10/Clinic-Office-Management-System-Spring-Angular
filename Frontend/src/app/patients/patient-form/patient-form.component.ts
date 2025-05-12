import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Patient } from 'src/app/services/patients.service';

@Component({
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.css'],
  standalone: true,
  imports: [FormsModule, RouterModule]
})
export class PatientFormComponent {

  @Input() patient: Patient;
  @Input() formHeader: string;
  @Output() formSubmit = new EventEmitter<Patient>();

  onSubmit(form: NgForm) {
    this.formSubmit.emit(this.buildPatientFromForm(form));
  }

  private buildPatientFromForm(form: NgForm): Patient {
    const data = form.value;
    const patient: any = { ...data };

    if (this.patient?.id) {
      patient.id = this.patient.id;
    }

    return patient;
  }


}
