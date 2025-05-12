package com.ewan.clinic_office_management_system.services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ewan.clinic_office_management_system.exceptions.common.BadRequestException;
import com.ewan.clinic_office_management_system.models.Patient;
import com.ewan.clinic_office_management_system.repositories.PatientRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    public Patient createPatient(Patient patient) {
        try {
            return patientRepository.save(patient);
        } catch (Exception e) {
            throw new BadRequestException("Error creating patient: " + e.getMessage());
        }
    }

    public List<Patient> getAllPatients() {
        try {
            return patientRepository.findAll();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch patients: " + e.getMessage());
        }
    }

    public Patient getPatientById(int id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Patient with ID " + id + " not found"));
    }

    public Patient updatePatient(Patient patient) {
        if (!patientRepository.existsById(patient.getId())) {
            throw new EntityNotFoundException("Patient with ID " + patient.getId() + " not found");
        }
        return patientRepository.save(patient);
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

}
