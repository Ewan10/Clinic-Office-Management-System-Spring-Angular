package com.ewan.clinic_office_management_system.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ewan.clinic_office_management_system.dto.PatientBasicDto;
import com.ewan.clinic_office_management_system.dto.PatientDto;
import com.ewan.clinic_office_management_system.exceptions.common.BadRequestException;
import com.ewan.clinic_office_management_system.models.Patient;
import com.ewan.clinic_office_management_system.repositories.PatientRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class PatientService {
    @Autowired
    private PatientRepository patientRepository;

    public PatientDto createPatient(PatientDto patientDto) {
        try {
            Patient patient = convertToPatient(patientDto);
            Patient updated = patientRepository.save(patient);
            return convertToPatientDto(updated);
        } catch (Exception e) {
            throw new BadRequestException("Error creating patient: " + e.getMessage());
        }
    }

    public List<PatientBasicDto> getAllPatients() {
        try {
            List<Patient> patients = patientRepository.findAll();
            return patients.stream()
                    .map(this::convertToPatientBasicDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch patients: " + e.getMessage());
        }
    }

    public PatientDto getPatientById(int id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Patient with ID " + id + " not found"));
        return convertToPatientDto(patient);
    }

    public PatientDto updatePatient(PatientDto patientDto) {
        if (!patientRepository.existsById(patientDto.getId())) {
            throw new EntityNotFoundException("Patient with ID " + patientDto.getId() + " not found");
        }
        Patient patient = convertToPatient(patientDto);
        Patient updated = patientRepository.save(patient);
        return convertToPatientDto(updated);
    }

    public void deletePatientById(int id) {
        if (!patientRepository.existsById(id)) {
            throw new EntityNotFoundException("Cannot delete. Patient with ID " + id + " not found.");
        }
        try {
            patientRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete patient: " + e.getMessage());
        }
    }

    private PatientBasicDto convertToPatientBasicDto(Patient patient) {
        return new PatientBasicDto(
                patient.getId(),
                patient.getFirstName(),
                patient.getLastName(),
                patient.getPhoneNumber(),
                patient.getEmail(),
                patient.getHealthInsuranceNumber(),
                patient.getAge());
    }

    private PatientDto convertToPatientDto(Patient patient) {
        return new PatientDto(
                patient.getId(),
                patient.getFirstName(),
                patient.getLastName(),
                patient.getPhoneNumber(),
                patient.getEmail(),
                patient.getHealthInsuranceNumber(),
                patient.getAge(),
                patient.getGender(),
                patient.getHistory(),
                patient.getPrescriptions());
    }

    private Patient convertToPatient(PatientDto dto) {
        Patient patient = new Patient();
        patient.setId(dto.getId());
        patient.setFirstName(dto.getFirstName());
        patient.setLastName(dto.getLastName());
        patient.setPhoneNumber(dto.getPhoneNumber());
        patient.setEmail(dto.getEmail());
        patient.setHealthInsuranceNumber(dto.getHealthInsuranceNumber());
        patient.setAge(dto.getAge());
        patient.setGender(dto.getGender());
        patient.setHistory(dto.getHistory());
        patient.setPrescriptions(dto.getPrescriptions());
        return patient;
    }

}
