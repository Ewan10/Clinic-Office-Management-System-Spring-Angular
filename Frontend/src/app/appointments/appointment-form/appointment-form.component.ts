import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { Appointment } from 'src/app/services/appointments.service';
import { CalendarComponent } from '../calendar/calendar.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, MatDialogModule, CalendarComponent]
})
export class AppointmentFormComponent {

  @Input() appointment: Appointment;
  @Input() formHeader: string;
  @Output() formSubmit = new EventEmitter<Appointment>();
  date: string;
  time: string;

  onSlotSelected(event: { date: string, time: string }) {
    const rawDate = new Date(event.date);
    this.date = rawDate.toISOString().slice(0, 10);
    this.time = rawDate.toTimeString().slice(0, 5);
  }

  onDateChange(newDate: string) {
    this.date = newDate;
  }

  onTimeChange(newTime: string) {
    this.time = newTime;
  }

  onSubmit(form: NgForm) {
    if (!this.date || !this.time) {
      alert('Please select a date and time from the calendar.');
      return;
    }
    this.formSubmit.emit(this.buildAppointmentFromForm(form));
  }

  private buildAppointmentFromForm(form: NgForm): Appointment {
    const data = form.value;
    const appointment: Appointment = {
      ...data,
      date: this.date,
      time: this.time
    };

    if (this.appointment?.id) {
      appointment.id = this.appointment.id;
    }
    return appointment;
  }
}
