import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarComponent } from './calendar.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('CalendarComponent', () => {
    let component: CalendarComponent;
    let fixture: ComponentFixture<CalendarComponent>;
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
    const appointmentsServiceSpy = jasmine.createSpyObj('AppointmentsService', ['viewAll']);
    (appointmentsServiceSpy.viewAll as jasmine.Spy).and.returnValue(of(mockAppointments)); // Mocking the viewAll method

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CalendarComponent, HttpClientTestingModule],
            providers: [
                { provide: 'AppointmentsService', useValue: jasmine.createSpyObj('AppointmentsService', ['viewAll']) }
            ]
        });

        fixture = TestBed.createComponent(CalendarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});