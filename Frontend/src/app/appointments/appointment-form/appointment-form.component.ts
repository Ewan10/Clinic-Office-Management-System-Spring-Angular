import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
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
  constructor(private dialog: MatDialog) { }
  @Input() appointment: Appointment;
  @Input() formHeader: string;
  @Output() formSubmit = new EventEmitter<Appointment>();
  date: string;
  time: string;

  // openCalendarDialog(): void {
  //   const dialogRef = this.dialog.open(CalendarComponent);

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       this.date = result.date;
  //       this.time = result.time;
  //     }
  //   });
  // }

  onSlotSelected(event: { date: string, time: string }) {
    this.date = event.date;
    this.time = event.time;
    console.log('Selected slot:', event);
  }

  onDateChange(newDate: string) {
    this.date = newDate;
  }

  onTimeChange(newTime: string) {
    this.time = newTime;
  }

  onSubmit(form: NgForm) {
    this.formSubmit.emit(this.buildAppointmentFromForm(form));
  }

  private buildAppointmentFromForm(form: NgForm): Appointment {
    const data = form.value;
    const appointment: any = { ...data };

    if (this.appointment?.id) {
      appointment.id = this.appointment.id;
    }
    return appointment;
  }
}
