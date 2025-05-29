import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Appointment, AppointmentsService } from 'src/app/services/appointments.service';
import { ModalService } from 'src/app/services/modal.service';
import { ModalsComponent } from 'src/app/shared/modals/modals.component';

@Component({
  selector: 'app-appointments-view',
  templateUrl: './appointments-view.component.html',
  styleUrls: ['./appointments-view.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, ModalsComponent]
})
export class AppointmentsViewComponent implements OnInit {
  private appointmentsService = inject(AppointmentsService);
  private router = inject(Router);

  ngOnInit(): void {
    this.onViewAll();
  }

  modalService = inject(ModalService);
  appointments: Appointment[];
  errorMessage: string;
  appointment: Appointment;
  isLoading: boolean = true;

  onViewAll() {
    this.isLoading = true;
    this.appointmentsService.viewAll()
      .subscribe((response: any) => {
        this.isLoading = false;
        this.appointments = [...response];
      },
        (error) => {
          this.isLoading = false;
          this.modalService.onNotify(error?.message, '/');
        });
  }

  onEdit($event) {
    this.router.navigate([`/appointments/edit/${$event}`]);
  }

  removeAppointment = (appointments: Appointment[], id): void => {
    const index = appointments.findIndex((appointments) => appointments.id === id);
    if (index !== -1) {
      appointments.splice(index, 1);
    }
  }

  async onDelete($event) {
    const appointment = this.appointments.find((appointment) => appointment.id === $event);
    if (appointment) {
      try {
        const confirmed = await this.modalService.onConfirm(`Are you sure you want to delete the appointment for Mr/Mrs ${appointment.patientFirstName} ${appointment.patientLastName}?`);
        if (!confirmed) {
          return;
        }
        else {
          this.appointmentsService.deleteAppointment($event)
            .subscribe((response: any) => {
              this.removeAppointment(this.appointments, $event);
              this.modalService.onNotify(`Appointment for Mr/Mrs ${appointment.patientFirstName} ${appointment.patientLastName} deleted successfully!`, '/appointments');
            },
              (error) => {
                this.modalService.onNotify(error?.message, '/appointments');
              })
        }
      } catch (error) {
        this.modalService.onNotify(error?.message, '/appointments');
      }
    }
  }

}
