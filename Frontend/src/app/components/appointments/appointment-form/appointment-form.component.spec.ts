import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentFormComponent } from './appointment-form.component';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AppointmentFormComponent', () => {
    let component: AppointmentFormComponent;
    let fixture: ComponentFixture<AppointmentFormComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppointmentFormComponent, HttpClientTestingModule],
            providers: [
                { provide: ActivatedRoute, useValue: {} }
            ]
        });

        fixture = TestBed.createComponent(AppointmentFormComponent);
        component = fixture.componentInstance;

        component.appointment = {
            id: 1,
            patientFirstName: 'John',
            patientLastName: 'Doe',
            doctor: 'Dr. Smith',
            room: 101,
            date: '2025-06-20',
            time: '10:00'
        };

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});