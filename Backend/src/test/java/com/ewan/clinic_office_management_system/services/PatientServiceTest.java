package com.ewan.clinic_office_management_system.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ewan.clinic_office_management_system.dto.PatientBasicDto;
import com.ewan.clinic_office_management_system.dto.PatientDto;
import com.ewan.clinic_office_management_system.exceptions.common.BadRequestException;
import com.ewan.clinic_office_management_system.models.Patient;
import com.ewan.clinic_office_management_system.repositories.PatientRepository;

import jakarta.persistence.EntityNotFoundException;

@ExtendWith(MockitoExtension.class)
public class PatientServiceTest {
    @Mock
    private PatientRepository patientRepository;
    @InjectMocks

    private PatientService patientService;
    private PatientDto patientDto;
    private Patient patient, savedPatient;

    @BeforeEach
    void setUp() {
        patientDto = new PatientDto();
        patientDto.setId(1);
        patientDto.setFirstName("Sergio");
        patientDto.setLastName("Ramos");
        patientDto.setPhoneNumber("123454-220");
        patientDto.setEmail("sergio@mail.es");
        patientDto.setHealthInsuranceNumber(1823882100);
        patientDto.setAge(66);
        patientDto.setGender("Male");
        patientDto.setHistory("");
        patientDto.setPrescriptions(List.of());

        patient = new Patient();
        patient.setId(1);
        patient.setFirstName("Sergio");
        patient.setLastName("Ramos");
        patient.setPhoneNumber("123454-220");
        patient.setEmail("sergio@mail.es");
        patient.setHealthInsuranceNumber(1823882100);
        patient.setAge(66);
        patient.setGender("Male");
        patient.setHistory("");
        patient.setPrescriptions(List.of());

        savedPatient = new Patient();
        savedPatient.setId(1);
        savedPatient.setFirstName("Sergio");
        savedPatient.setLastName("Ramos");
        savedPatient.setPhoneNumber("123454-220");
        savedPatient.setEmail("sergio@mail.es");
        savedPatient.setHealthInsuranceNumber(1823882100);
        savedPatient.setAge(66);
        savedPatient.setGender("Male");
        savedPatient.setHistory("");
        savedPatient.setPrescriptions(List.of());
    }

    @Test
    void shouldCreatePatient() {
        when(patientRepository.save(any(Patient.class))).thenReturn(savedPatient);
        PatientDto result = patientService.createPatient(patientDto);
        assertEquals("Sergio", result.getFirstName());
        assertEquals("Ramos", result.getLastName());
        assertEquals("sergio@mail.es", result.getEmail());
        assertEquals(1, result.getId());
        verify(patientRepository, times(1)).save(any(Patient.class));
    }

    @Test
    void shouldThrowBadRequestExceptionWhenSaveFails() {
        when(patientRepository.save(any(Patient.class)))
                .thenThrow(new RuntimeException("DB error"));
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> patientService.createPatient(patientDto));
        assertTrue(ex.getMessage().contains("Error creating patient"));
        verify(patientRepository, times(1)).save(any(Patient.class));
    }

    @Test
    void shouldReturnAllPatientsSuccessfully() {
        Patient patient2 = new Patient();
        patient2.setId(2);
        patient2.setFirstName("Maria");
        patient2.setLastName("Antoianneta");
        patient2.setPhoneNumber("12-3354-220");
        patient2.setEmail("maria@mail.es");
        patient2.setHealthInsuranceNumber(1855882100);
        patient2.setAge(44);
        patient2.setGender("Female");
        patient2.setHistory("");
        patient2.setPrescriptions(List.of());
        List<Patient> mockPatients = Arrays.asList(patient, patient2);

        when(patientRepository.findAll()).thenReturn(mockPatients);
        List<PatientBasicDto> result = patientService.getAllPatients();
        assertEquals(2, result.size());
        assertEquals("Sergio", result.get(0).getFirstName());
        assertEquals("Maria", result.get(1).getFirstName());
        verify(patientRepository, times(1)).findAll();
    }

    @Test
    void shouldThrowRuntimeExceptionWhenRepositoryFails() {
        when(patientRepository.findAll()).thenThrow(new RuntimeException("DB error"));
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            patientService.getAllPatients();
        });
        assertTrue(exception.getMessage().contains("Failed to fetch patients"));
        verify(patientRepository, times(1)).findAll();
    }

    @Test
    void shouldReturnPatientById() {
        int id = 1;
        when(patientRepository.findById(id)).thenReturn(Optional.of(patient));
        PatientDto result = patientService.getPatientById(id);
        assertEquals(patient.getFirstName(), result.getFirstName());
        assertEquals(patient.getEmail(), result.getEmail());
        assertEquals(patient.getId(), result.getId());
        verify(patientRepository, times(1)).findById(id);
    }

    @Test
    void shouldThrowExceptionWhenPatientNotFound() {
        int id = 99;
        when(patientRepository.findById(id)).thenReturn(Optional.empty());
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
            patientService.getPatientById(id);
        });
        assertEquals("Patient with ID 99 not found", exception.getMessage());
        verify(patientRepository, times(1)).findById(id);
    }

    @Test
    void shouldUpdatePatientSuccessfully() {
        patientDto.setFirstName("Joaquin");
        patientDto.setLastName("Sottomayor");
        patientDto.setEmail("joq@mail.c");

        patient.setFirstName("Joaquin");
        patient.setLastName("Sottomayor");
        patient.setEmail("joq@mail.c");

        when(patientRepository.existsById(patientDto.getId())).thenReturn(true);
        when(patientRepository.save(any(Patient.class))).thenReturn(patient);
        PatientDto result = patientService.updatePatient(patientDto);

        assertEquals(patientDto.getId(), result.getId());
        assertEquals("Joaquin", result.getFirstName());
        assertEquals("Sottomayor", result.getLastName());
        assertEquals("joq@mail.c", result.getEmail());
        verify(patientRepository, times(1)).existsById(1);
        verify(patientRepository, times(1)).save(any(Patient.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonExistingPatient() {
        int nonExistingId = 99;
        PatientDto nonExistingDto = new PatientDto();
        nonExistingDto.setId(nonExistingId);

        when(patientRepository.existsById(nonExistingId)).thenReturn(false);
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
            patientService.updatePatient(nonExistingDto);
        });
        assertEquals("Patient with ID 99 not found", exception.getMessage());
        verify(patientRepository, times(1)).existsById(nonExistingId);
        verify(patientRepository, never()).save(any(Patient.class));
    }

    @Test
    void shouldDeletePatientSuccessfully() {
        int id = 1;
        when(patientRepository.existsById(id)).thenReturn(true);
        doNothing().when(patientRepository).deleteById(id);
        patientService.deletePatientById(id);
        verify(patientRepository, times(1)).existsById(id);
        verify(patientRepository, times(1)).deleteById(id);
    }

    @Test
    void shouldThrowExceptionWhenPatientIdNotFound() {
        int id = 99;
        when(patientRepository.existsById(id)).thenReturn(false);
        EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> patientService.deletePatientById(id));
        assertEquals("Cannot delete. Patient with ID 99 not found.", exception.getMessage());
        verify(patientRepository, times(1)).existsById(id);
        verify(patientRepository, never()).deleteById(anyInt());
    }

}
