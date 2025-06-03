import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PatientDetailed } from 'src/app/models';
import { PatientsService } from 'src/app/services/patients.service';
import { PrescriptionsComponent } from "../../prescriptions/prescriptions.component";

@Component({
  selector: 'app-patient-view',
  templateUrl: './patient-view.component.html',
  styleUrls: ['./patient-view.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, PrescriptionsComponent]
})
export class PatientViewComponent implements OnInit {
  showPrescriptions = false;
  patient: PatientDetailed | null = null;
  private patientsService = inject(PatientsService);
  private router = inject(Router);

  ngOnInit(): void {
    this.patientsService.patients$.subscribe(patient => {
      this.patient = patient;
      if (!this.patient) {
        this.router.navigate(['/patients']);
      }
    })
    // this.patient = this.patientsService.getPatient();

  }

  togglePrescriptions() {
    this.showPrescriptions = !this.showPrescriptions;
  }
}
