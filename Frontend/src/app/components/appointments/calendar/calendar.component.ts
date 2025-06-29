import { Component, EventEmitter, inject, OnInit, Output, ViewChild } from '@angular/core';
import { AppointmentsService } from 'src/app/services/appointments.service';
import { MatDialogModule } from '@angular/material/dialog';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions } from '@fullcalendar/core';
import { CommonModule } from '@angular/common';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { format } from 'date-fns';

declare var bootstrap: any;

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  standalone: true,
  imports: [CommonModule, FullCalendarModule, MatDialogModule]

})
export class CalendarComponent implements OnInit {
  private appointmentsService = inject(AppointmentsService);
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
    slotLabelInterval: '00:20:00',
    slotDuration: '00:20:00',
    slotMinTime: '09:00:00',
    slotMaxTime: '21:00:00',
    displayEventTime: false,
    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    allDaySlot: false,
    dateClick: (info) => {
      this.handleDateClick(info);
    },
    eventDidMount: (info) => {
      const tooltip = info.event.extendedProps.tooltip;
      if (tooltip) {
        info.el.setAttribute('data-bs-toggle', tooltip);
        info.el.setAttribute('data-bs-placement', 'top');
        info.el.setAttribute('title', tooltip);
        new bootstrap.Tooltip(info.el)

      }
    }
  };

  handleDateClick(arg: any) {
    const selected = {
      date: arg.dateStr,
      time: format(arg.date, 'HH:mm')
    };

    this.slotSelected.emit(selected);

    const start = new Date(arg.date);
    const end = new Date(start.getTime() + 20 * 60000);

    const timeStart = format(start, 'HH:mm');
    const timeEnd = format(end, 'HH:mm');

    this.calendarEvents = this.calendarEvents.filter(event => event.extendedProps?.isPlaceholder !== true);


    this.calendarEvents = [
      ...this.calendarEvents,
      {
        title: `${timeStart}: ${timeEnd}`,
        start: start.toISOString(),
        end: end.toISOString(),
        classNames: ['appointment-event'],
        extendedProps: {
          isPlaceholder: true,
          time: selected.time
        }
      }
    ];

    this.calendarOptions = {
      ...this.calendarOptions,
      events: [...this.calendarEvents]
    };

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
            classNames: ['appointment-event'],
            extendedProps: {
              roomNumber: appointment.roomNumber,
              appointmentId: appointment.id,
              tooltip: `Patient: ${appointment.patientFirstName} ${appointment.patientLastName}, Doctor: ${appointment.doctor}, Room: ${appointment.room}`
            }
          };
        });

        this.calendarOptions.events = this.calendarEvents;
      });
  }

}
