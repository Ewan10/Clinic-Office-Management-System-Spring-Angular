import { HttpResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Appointment, AppointmentsService } from 'src/app/services/appointments.service';
import { ModalService } from 'src/app/services/modal.service';
import { AppointmentFormComponent } from '../appointment-form/appointment-form.component';
import { CommonModule } from '@angular/common';
import { ModalsComponent } from 'src/app/shared/modals/modals.component';

@Component({
  selector: 'app-make-appointment',
  templateUrl: './make-appointment.component.html',
  styleUrls: ['./make-appointment.component.css'],
  standalone: true,
  imports: [AppointmentFormComponent, ModalsComponent, CommonModule]
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

  private appointmentsService = inject(AppointmentsService);
  modalService = inject(ModalService);

  onSubmit(appointment: Appointment) {
    this.appointmentsService.registerAppointment(appointment)
      .subscribe((response: HttpResponse<Appointment>) => {
        console.log('status: ', response.status);
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
