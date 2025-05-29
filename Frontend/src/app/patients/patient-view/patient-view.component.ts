import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Patient, PatientsService } from 'src/app/services/patients.service';

@Component({
  selector: 'app-patient-view',
  templateUrl: './patient-view.component.html',
  styleUrls: ['./patient-view.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class PatientViewComponent implements OnInit {

  patient: Patient | null = null;
  private patientsService = inject(PatientsService);
  private router = inject(Router);

  ngOnInit(): void {
    this.patient = this.patientsService.getPatient();
    if (!this.patient) {
      this.router.navigate(['/patients']);
    }
  }

}
