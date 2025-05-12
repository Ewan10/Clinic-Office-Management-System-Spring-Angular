import { Component, EventEmitter, inject, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { AppointmentsService } from 'src/app/services/appointments.service';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions } from '@fullcalendar/core';
import { CommonModule } from '@angular/common';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { format } from 'date-fns';


@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  standalone: true,
  imports: [CommonModule, FullCalendarModule, MatDialogModule]

})
export class CalendarComponent implements OnInit {
  constructor(@Optional() public dialogRef: MatDialogRef<CalendarComponent>) { }
  private appointmentsService = inject(AppointmentsService);
  private dialog = inject(MatDialog);
  @Output() slotSelected = new EventEmitter<{ date: string; time: string }>();
  @ViewChild(FullCalendarComponent) calendarComponent: FullCalendarComponent;

  ngOnInit() {
    this.fetchAppointments();
  }

  calendarPlugins = [dayGridPlugin, timeGridPlugin, interactionPlugin];

  headerToolbar = {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  };

  calendarEvents: any[] = [];

  calendarOptions: CalendarOptions = {
    plugins: this.calendarPlugins,
    initialView: 'timeGridWeek',
    events: this.calendarEvents,
    headerToolbar: this.headerToolbar,
    slotDuration: '00:20:00',
    slotMinTime: '09:00:00',
    slotMaxTime: '21:00:00',
    allDaySlot: false,
    dateClick: (info) => {
      this.handleDateClick(info);
    }
  };

  handleDateClick(arg: any) {
    console.log('handleDateClick: ', arg);
    const selected = {
      date: arg.dateStr,
      time: format(arg.date, 'HH:mm')
    };
    console.log('Selected date and time:', selected);

    const start = new Date(selected.date);
    const end = new Date(start.getTime() + 20 * 60000);

    this.calendarEvents = [
      ...this.calendarEvents,
      {
        title: ``,
        start: start.toISOString(),
        end: end.toISOString(),
        extendedProps: {
          time: selected.time
        }
      }
    ];

    this.calendarOptions = {
      ...this.calendarOptions,
      events: [...this.calendarEvents]
    };

    if (this.dialogRef) {
      this.dialogRef.close(selected);
    } else {
      this.slotSelected.emit(selected);
    }
  }

  fetchAppointments() {
    this.appointmentsService
      .viewAll().subscribe((appointments: any) => {
        this.calendarEvents = appointments.map(appointment => {

          const combinedDateTime = `${appointment.date}T${appointment.time}`;
          const start = new Date(combinedDateTime);
          const end = new Date(start.getTime() + 20 * 60000);

          return {
            title: `Room ${appointment.room}`,
            start: start.toISOString(),
            end: end.toISOString(),
            extendedProps: {
              roomNumber: appointment.roomNumber,
              appointmentId: appointment.id
            }
          };
        });

        this.calendarOptions.events = this.calendarEvents;
      });
  }

}
