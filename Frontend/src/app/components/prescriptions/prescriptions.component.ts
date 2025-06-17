import { Component, inject, Input } from '@angular/core';
import { Prescription } from '../../models';
import { CommonModule } from '@angular/common';
import { PatientsService } from '../../services/patients.service';
import { HttpResponse } from '@angular/common/http';
import { ModalsComponent } from '../../shared/modals/modals.component';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-prescriptions',
  imports: [CommonModule, ModalsComponent],
  templateUrl: './prescriptions.component.html',
  styleUrl: './prescriptions.component.css'
})
export class PrescriptionsComponent {

  @Input() patientId: number;
  showForm = false;
  modalService = inject(ModalService);
  prescription: Prescription;
  patientService = inject(PatientsService);
  toggleForm() {
    this.showForm = !this.showForm;

    if (this.showForm) {
      this.prescription = {
        id: null,
        date: '',
        diagnosis: '',
        medicines: ['']
      };
    }
  }

  addMedicine() {
    this.prescription.medicines.push('');
  }

  updateMedicine(value: string, index: number) {
    this.prescription.medicines[index] = value;
  }

  removeMedicine(index: number) {
    this.prescription.medicines.splice(index, 1);
  }

  savePrescription(date: string, diagnosis: string) {
    this.prescription.id = null;
    this.prescription.date = date;
    this.prescription.diagnosis = diagnosis;
    this.prescription.medicines = [...this.prescription.medicines.filter(m => m.trim() !== '')];
    this.patientService.createPrescription(this.patientId, this.prescription).subscribe({
      next: (response: HttpResponse<Prescription>) => {
        if (response.status === 201) {
          this.patientService.viewPatient(this.patientId).subscribe(updatedPatient => {
            this.patientService.setPatient(updatedPatient);
          });
          this.modalService.onNotify(
            `Prescription saved!`,
            `/patients/view/${this.patientId}`);
          this.toggleForm();
        }

      },
      error: (error) => {
        this.modalService.onNotify(`Failed to submit the prescription: ${error.message}`, `/patients/view/${this.patientId}`);
      }
    });
  }

}