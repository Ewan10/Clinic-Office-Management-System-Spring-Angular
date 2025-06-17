import { Component, inject, OnInit } from '@angular/core';
import { PatientsService } from 'src/app/services/patients.service';
import { Router, RouterModule } from '@angular/router';
import { ModalService } from 'src/app/services/modal.service';
import { CommonModule } from '@angular/common';

import { ModalsComponent } from 'src/app/shared/modals/modals.component';
import { PatientBasic, PatientDetailed } from 'src/app/models';

declare var bootstrap: any;

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, ModalsComponent]
})
export class PatientsComponent implements OnInit {
  message: string;
  private patientsService = inject(PatientsService);
  private router = inject(Router);
  modalService = inject(ModalService);

  patient: PatientDetailed;
  patients: PatientBasic[];
  isLoading = false;
  errorMessage: string = '';

  ngOnInit(): void {
    this.onViewAll();
  }

  onViewAll() {
    this.isLoading = true;
    this.patientsService.viewAll()
      .subscribe((response: any) => {
        this.patients = [...response];
        this.isLoading = false;
      },
        (error) => {
          this.modalService.onNotify(`Failed to load the patients: ${error.message}`, '/');
        }
      )
  }

  onViewPatient($event) {
    this.patientsService.viewPatient($event).subscribe({
      next: (patient) => {
        this.patientsService.setPatient(patient);
        this.router.navigate([`/patients/view/${$event}`]);
      },
      error: (error) => {
        this.modalService.onNotify(`Failed to get the patient: ${error.message}`, '/patients');
      }
    });

  }

  onEdit($event) {
    this.patientsService.viewPatient($event).subscribe({
      next: (patient) => {
        this.patientsService.setPatient(patient);
        this.router.navigate([`/patients/edit/${$event}`]);
      },
      error: (error) => {
        this.modalService.onNotify(`Failed to get the patient: ${error.message}`, '/patients');
      }
    });
  }

  private removePatient = (patients: PatientBasic[], id): void => {
    const index = patients.findIndex((patient) => patient.id === id);
    if (index !== -1) {
      patients.splice(index, 1);
    }
  }

  async onDelete($event) {
    const patient = this.patients.find((patient) => patient.id === $event);
    if (patient) {
      this.message = `Are you sure you want to delete the patient:
                     ${patient.firstName} ${patient.lastName}?`;
      try {
        const confirmed = await this.modalService.onConfirm(this.message);
        if (!confirmed) {
          return;
        }
        else {
          this.patientsService.deletePatient($event)
            .subscribe((response: any) => {
              const patient = this.patients.find((patient) => patient.id === $event);
              if (patient) {
                this.removePatient(this.patients, $event);
                this.modalService.onNotify(`Patient: ${patient.firstName} ${patient.lastName} deleted successfully`,
                  '/patients');
              }
            },
              (error) => {
                this.modalService.onNotify(`Error deleting patient: ${error.message}`,
                  '/patients');
              }
            );
        }
      } catch (error) {
        this.modalService.onNotify(`Error deleting patient: ${error.message}`,
          '/patients');
      }
    }
  }
}
