import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentFormComponent } from './appointment-form.component';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgForm } from '@angular/forms';
import { Appointment } from 'src/app/services/appointments.service';

describe('AppointmentFormComponent', () => {
    let component: AppointmentFormComponent;
    let fixture: ComponentFixture<AppointmentFormComponent>;
    let formSubmitSpy: jasmine.Spy;

    const mockForm = {
        value: {
            doctor: 'Dr Pereira',
            patientFirstName: 'Roberto',
            patientLastName: 'DaSilva',
            room: 120
        }
    } as NgForm;



    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppointmentFormComponent, HttpClientTestingModule],
            providers: [
                { provide: ActivatedRoute, useValue: {} }
            ]
        });

        fixture = TestBed.createComponent(AppointmentFormComponent);
        component = fixture.componentInstance;
        formSubmitSpy = spyOn(component.formSubmit, 'emit');

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

    it('should format and set the date and the time when a slot is selected', () => {
        const slot = { date: '2025-06-30T10:40:00', time: '10:40' };
        component.onSlotSelected(slot);
        expect(component.date).toBe('2025-06-30');
        expect(component.time).toBe('10:40');
    });

    it('should set date when onDateChange is called', () => {
        component.onDateChange('2025-07-01');
        expect(component.date).toBe('2025-07-01');
    });

    it('should set time when onTimeChange is called', () => {
        component.onTimeChange('11:30');
        expect(component.time).toBe('11:30');
    });

    it('should emit formSubmit with appointment when form is valid', () => {
        component.date = '2025-07-01';
        component.time = '09:00';
        component.onSubmit(mockForm);

        expect(formSubmitSpy).toHaveBeenCalledWith(jasmine.objectContaining({
            doctor: 'Dr Pereira',
            patientFirstName: 'Roberto',
            patientLastName: 'DaSilva',
            room: 120,
            date: '2025-07-01',
            time: '09:00'
        }));
    });

    it('should not emit formSubmit if date or time is missing', () => {
        const alertSpy = spyOn(window, 'alert');
        mockForm.value.date = '';
        component.onSubmit(mockForm);

        expect(alertSpy).toHaveBeenCalledWith('Please select a date and time from the calendar.');
        expect(formSubmitSpy).not.toHaveBeenCalled();
    });

    it('should include id in emitted appointment if editing existing one', () => {
        component.date = '2025-07-01';
        component.time = '13:00';
        component.appointment = { id: 5 } as Appointment;
        const mockForm = {
            value: {
                doctor: 'Dr Pereira',
                patientFirstName: 'Alfonsina',
                patientLastName: 'Azul',
                room: 220
            }
        } as NgForm;

        const result = component['buildAppointmentFromForm'](mockForm);
        expect(result.id).toBe(5);
    });


});