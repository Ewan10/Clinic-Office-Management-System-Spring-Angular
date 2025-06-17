import { HttpResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PatientsService } from 'src/app/services/patients.service';
import { ModalService } from 'src/app/services/modal.service';
import { PatientFormComponent } from '../patient-form/patient-form.component';
import { ModalsComponent } from 'src/app/shared/modals/modals.component';
import { CommonModule } from '@angular/common';
import { PatientDetailed } from 'src/app/models';

@Component({
  selector: 'app-patient-edit',
  templateUrl: './patient-edit.component.html',
  styleUrls: ['./patient-edit.component.css'],
  standalone: true,
  imports: [CommonModule, PatientFormComponent, ModalsComponent]
})
export class PatientEditComponent {
  private patientsService = inject(PatientsService);
  private route = inject(ActivatedRoute);
  modalService = inject(ModalService);

  patient: PatientDetailed;
  modalType = signal<string | null>('');
  modalMessage = signal<string>('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.patientsService.viewPatient(id)
      .subscribe({
        next: (patient) => { this.patient = patient },
        error: (error) => {
          this.modalService.onNotify(error.message, '/patients');
        }
      });
  }

  onEdit(patient) {
    this.patientsService.updatePatient(patient)
      .subscribe(
        (response: HttpResponse<PatientDetailed>) => {
          if (response.status === 200) {
            this.modalService.onNotify(
              `Patient: ${patient.firstName} ${patient.lastName} updated successfully!`,
              '/patients');
          }
        },
        (error) => {
          this.modalService.onNotify(error.message,
            '/patients');
        });
  }
}
