import { HttpResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Appointment, AppointmentsService } from 'src/app/services/appointments.service';
import { ModalService } from 'src/app/services/modal.service';
import { AppointmentFormComponent } from '../appointment-form/appointment-form.component';
import { C } from '@fullcalendar/core/internal-common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-make-appointment',
  templateUrl: './make-appointment.component.html',
  styleUrls: ['./make-appointment.component.css'],
  standalone: true,
  imports: [AppointmentFormComponent, CommonModule]
})
export class MakeAppointmentComponent {
  errorMessage: any;
  appointment: Appointment = {
    id: null,
    date: '',
    time: '',
    room: null,
    doctor: '',
    patientFirstName: '',
    patientLastName: ''
  };

  constructor(private appointmentsService: AppointmentsService,

    private router: Router) { }
  modalService = inject(ModalService);
  onSubmit(appointment: Appointment) {
    this.appointmentsService.registerAppointment(appointment)
      .subscribe((response: HttpResponse<Appointment>) => {
        if (response.status === 201) {
          this.modalService.onNotify(`Appointment created successfully!`,
            '/appointments'
          );
        }
      },
        (error) => {
          this.modalService.onNotify(error.message,
            '/appointments');
        }
      );
  }
}
