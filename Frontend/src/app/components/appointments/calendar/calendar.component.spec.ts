import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CalendarComponent } from './calendar.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { AppointmentsService } from '../../../services/appointments.service';
import { FullCalendarModule } from '@fullcalendar/angular';

describe('CalendarComponent', () => {
    let component: CalendarComponent;
    let fixture: ComponentFixture<CalendarComponent>;
    let appointmentsServiceSpy: jasmine.SpyObj<AppointmentsService>;


    const mockAppointments = [
        {
            id: 1,
            date: '2025-06-20',
            time: '10:00',
            room: 101,
            doctor: 'Dr. Smith',
            patientFirstName: 'John',
            patientLastName: 'Doe'
        },
        {
            id: 2,
            date: '2025-06-21',
            time: '11:00',
            room: 102,
            doctor: 'Dr. Jones',
            patientFirstName: 'Jane',
            patientLastName: 'Doe'
        }
    ];

    beforeEach(() => {
        appointmentsServiceSpy = jasmine.createSpyObj('AppointmentsService', ['viewAll']);
        appointmentsServiceSpy.viewAll.and.returnValue(of(mockAppointments));

        TestBed.configureTestingModule({
            imports: [CalendarComponent, HttpClientTestingModule, FullCalendarModule],
            providers: [
                { provide: AppointmentsService, useValue: appointmentsServiceSpy }
            ]
        });

        fixture = TestBed.createComponent(CalendarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch and transform appointments on init', fakeAsync(() => {
        component.fetchAppointments();
        tick();

        expect(component.calendarEvents.length).toBe(2);
        expect(component.calendarEvents[0].title).toBe('Room 101');
        expect(component.calendarEvents[0].extendedProps.tooltip)
            .toContain('Patient: John Doe');
    }));

    it('should emit selected slot when date is clicked', () => {
        spyOn(component.slotSelected, 'emit');

        const testDate = new Date('2024-06-25T14:00');
        const mockArg = { dateStr: '2024-06-25', date: testDate };

        component.handleDateClick(mockArg);

        expect(component.slotSelected.emit).toHaveBeenCalledWith({
            date: '2024-06-25',
            time: '14:00'
        });
    });

    it('should add a placeholder event to calendarEvents on click', () => {
        const initialLength = component.calendarEvents.length;
        const testDate = new Date(2024, 5, 25, 14, 0);
        const mockArg = { dateStr: '2024-06-25', date: testDate };
        component.handleDateClick(mockArg);

        expect(component.calendarEvents.length).toBe(initialLength + 1);
        const addedEvent = component.calendarEvents.find(e => e.extendedProps?.isPlaceholder);
        expect(addedEvent).toBeTruthy();
        expect(addedEvent.title).toContain('14:00');
    });

});