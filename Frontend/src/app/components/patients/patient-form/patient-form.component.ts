import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PatientDetailed } from 'src/app/models';

@Component({
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.css'],
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule]
})
export class PatientFormComponent {

  @Input() patient: PatientDetailed;
  @Input() formHeader: string;
  @Output() formSubmit = new EventEmitter<PatientDetailed>();

  onSubmit(form: NgForm) {
    if (form.invalid) return;
    this.formSubmit.emit(this.buildPatientFromForm(form));
  }

  private buildPatientFromForm(form: NgForm): PatientDetailed {
    const data = form.value;
    const patient: any = { ...data };

    if (this.patient?.id) {
      patient.id = this.patient.id;
    }

    return patient;
  }


}
