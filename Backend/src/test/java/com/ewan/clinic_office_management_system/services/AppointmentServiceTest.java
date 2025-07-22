package com.ewan.clinic_office_management_system.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import java.util.Optional;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;

import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.Test;
import com.ewan.clinic_office_management_system.dto.AppointmentDto;
import com.ewan.clinic_office_management_system.exceptions.common.BadRequestException;
import com.ewan.clinic_office_management_system.models.Appointment;
import com.ewan.clinic_office_management_system.models.Patient;
import com.ewan.clinic_office_management_system.repositories.AppointmentRepository;
import com.ewan.clinic_office_management_system.repositories.PatientRepository;

import jakarta.persistence.EntityNotFoundException;

import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;
    @Mock
    private PatientRepository patientRepository;
    @InjectMocks
    private AppointmentService appointmentService;
    private Appointment appointment;
    private AppointmentDto appointmentDto;

    @BeforeEach
    void setUp() {
        Patient patient = new Patient();
        patient.setId(1);
        patient.setFirstName("Juan");
        patient.setLastName("Alvez");
        patient.setAge(55);
        patient.setGender("male");
        patient.setPhoneNumber("1234567890");
        patient.setEmail("pat@mail.com");
        patient.setHealthInsuranceNumber(1234567891);
        patient.setHistory("");

        appointment = new Appointment();
        appointment.setId(1);
        appointment.setDate(LocalDateTime.of(2025, 7, 4, 10, 30));
        appointment.setRoom(101);
        appointment.setDoctor("Dr. Oliveira");
        appointment.setPatient(patient);
        appointmentDto = new AppointmentDto(
                1,
                "2025-07-04",
                "10:00",
                120,
                "Dr. Pereira",
                "Juan",
                "Alvez");
    }

    @Test
    void testGetAllAppointments() {
        when(appointmentRepository.findAll()).thenReturn(List.of(appointment));
        String expectedDate = "2025-07-04";
        String expectedTime = "10:30";
        List<AppointmentDto> appointments = appointmentService.getAllAppointments();

        assertEquals(1, appointments.size());
        AppointmentDto appointmentDto = appointments.get(0);

        assertEquals(1, appointmentDto.getId());
        assertEquals(expectedDate, appointmentDto.getDate());
        assertEquals(expectedTime, appointmentDto.getTime());
        assertEquals("Dr. Oliveira", appointmentDto.getDoctor());
        verify(appointmentRepository, times(1)).findAll();
    }

    @Test
    void testGetAllAppointmentsThrowsRuntimeException() {
        when(appointmentRepository.findAll()).thenThrow(new RuntimeException("Database failure"));
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            appointmentService.getAllAppointments();
        });
        assertTrue(exception.getMessage().contains("Failed to fetch appointments: Database failure"));
    }

    @Test
    void testUpdateAppointmentSuccess() {
        int appointmentId = 1;
        Appointment existingAppointment = new Appointment();
        existingAppointment.setId(appointmentId);
        existingAppointment.setPatient(new Patient());
        Patient patient = new Patient();
        patient.setFirstName("Juan");
        patient.setLastName("Alvez");

        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(existingAppointment));
        when(patientRepository.findByFirstNameAndLastName("Juan", "Alvez")).thenReturn(Optional.of(patient));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        AppointmentDto updated = appointmentService.updateAppointment(appointmentId, appointmentDto);

        assertNotNull(updated);
        assertEquals(appointmentDto.getRoom(), updated.getRoom());
        assertEquals(appointmentDto.getDoctor(), updated.getDoctor());
        assertEquals(appointmentDto.getPatientFirstName(), updated.getPatientFirstName());
        assertEquals(appointmentDto.getPatientLastName(), updated.getPatientLastName());

        verify(appointmentRepository, times(1)).findById(appointmentId);
        verify(patientRepository, times(1)).findByFirstNameAndLastName("Juan", "Alvez");
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
    }

    @Test
    void testUpdateAppointmentAppointmentNotFound() {
        int appointmentId = 99;
        AppointmentDto dto = new AppointmentDto(appointmentId, "2025-07-04", "10:30", 130, "Dr. Smith", "John", "Doe");
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.empty());
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            appointmentService.updateAppointment(appointmentId, dto);
        });
        assertTrue(exception.getMessage().contains("Appointment with id 99 not found"));
        verify(appointmentRepository, times(1)).findById(appointmentId);
        verifyNoMoreInteractions(patientRepository, appointmentRepository);
    }

    @Test
    void testUpdateAppointmentPatientNotFound() {
        int appointmentId = 1;
        Appointment existingAppointment = new Appointment();
        existingAppointment.setId(appointmentId);
        existingAppointment.setPatient(new Patient());

        AppointmentDto dto = new AppointmentDto(appointmentId, "2025-07-04", "10:30", 220, "Dr. Smith", "Maria",
                "Alvez");

        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(existingAppointment));
        when(patientRepository.findByFirstNameAndLastName("Maria", "Alvez")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            appointmentService.updateAppointment(appointmentId, dto);
        });

        assertTrue(exception.getMessage().contains("Patient Maria Alvez not found"));
        verify(appointmentRepository, times(1)).findById(appointmentId);
        verify(patientRepository, times(1)).findByFirstNameAndLastName("Maria", "Alvez");
    }

    @Test
    void testCreateAppointmentSuccess() {
        when(patientRepository.findByFirstNameAndLastName("Juan", "Alvez"))
                .thenReturn(Optional.of(appointment.getPatient()));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);
        AppointmentDto result = appointmentService.createAppointment(appointmentDto);
        assertNotNull(result);
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
    }

    @Test
    void testCreateAppointmentMissingFieldsShouldThrowBadRequest() {
        AppointmentDto dto = new AppointmentDto();
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            appointmentService.createAppointment(dto);
        });
        assertTrue(exception.getMessage().contains("Fill in all the fields"));
    }

    @Test
    void testCreateAppointmentSaveThrowsExceptionShouldWrapAsBadRequest() {
        when(patientRepository.findByFirstNameAndLastName("Juan", "Alvez"))
                .thenReturn(Optional.of(appointment.getPatient()));

        when(appointmentRepository.save(any(Appointment.class))).thenThrow(new RuntimeException("DB error"));
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            appointmentService.createAppointment(appointmentDto);
        });
        assertTrue(exception.getMessage().contains("Failed to create appointment"));
    }

    @Test
    void testGetAppointmentByIdSuccess() {
        when(appointmentRepository.findById(1)).thenReturn(Optional.of(appointment));
        AppointmentDto result = appointmentService.getAppointmentById(1);
        assertNotNull(result);
        assertEquals(1, result.getId());
        assertEquals("Juan", result.getPatientFirstName());
        assertEquals("Alvez", result.getPatientLastName());
        assertEquals("2025-07-04", result.getDate());
        assertEquals("10:30", result.getTime());
        assertEquals("Dr. Oliveira", result.getDoctor());
        assertEquals(101, result.getRoom());
        verify(appointmentRepository, times(1)).findById(1);
    }

    @Test
    void testGetAppointmentByIdNotFound() {
        when(appointmentRepository.findById(99)).thenReturn(Optional.empty());
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
            appointmentService.getAppointmentById(99);
        });
        assertTrue(exception.getMessage().contains("Appointment with ID 99 not found"));
        verify(appointmentRepository, times(1)).findById(99);
    }

    @Test
    void testDeleteAppointmentByIdSuccess() {
        when(appointmentRepository.findById(1)).thenReturn(Optional.of(appointment));
        appointmentService.deleteAppointmentById(1);
        verify(appointmentRepository, times(1)).findById(1);
        verify(appointmentRepository, times(1)).deleteById(1);
    }

    @Test
    void testDeleteAppointmentByIdNotFound() {
        when(appointmentRepository.findById(99)).thenReturn(Optional.empty());
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
            appointmentService.deleteAppointmentById(99);
        });
        assertTrue(exception.getMessage().contains("Appointment with ID 99 not found"));
        verify(appointmentRepository, times(1)).findById(99);
        verify(appointmentRepository, never()).deleteById(anyInt());
    }

}