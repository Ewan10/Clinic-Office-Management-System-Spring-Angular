import { Component, inject, OnInit } from '@angular/core';
import { Appointment, AppointmentsService } from '../../services/appointments.service';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { ModalService } from 'src/app/services/modal.service';
import { AppointmentFormComponent } from '../appointment-form/appointment-form.component';
import { ModalsComponent } from 'src/app/shared/modals/modals.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-appointments',
  templateUrl: './edit-appointments.component.html',
  styleUrls: ['./edit-appointments.component.css'],
  standalone: true,
  imports: [AppointmentFormComponent, ModalsComponent, CommonModule]
})
export class EditAppointmentsComponent implements OnInit {
  private appointmentsService = inject(AppointmentsService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.appointmentsService.viewAppointment(id)
      .subscribe({
        next: (appointment) => {
          this.appointment = appointment;
        },
        error: (error) => {
          this.modalService.onNotify(error.message, '/appointments');
        }
      });
  }

  modalService = inject(ModalService);
  appointment: Appointment;
  errorMessage: any;

  onSubmit(appointment) {
    this.appointmentsService.updateAppointment(appointment)
      .subscribe((response: HttpResponse<Appointment>) => {
        if (response.status === 200) {
          this.modalService.onNotify(
            `Appointment: ${appointment.id} updated successfully!`,
            '/appointments');
        }
      },
        (error) => {
          this.modalService.onNotify(error.message, '/appointments');
        });
  }

}
