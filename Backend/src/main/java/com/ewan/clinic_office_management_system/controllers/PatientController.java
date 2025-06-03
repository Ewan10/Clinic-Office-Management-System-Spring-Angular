package com.ewan.clinic_office_management_system.controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ewan.clinic_office_management_system.dto.PatientBasicDto;
import com.ewan.clinic_office_management_system.dto.PatientDto;
import com.ewan.clinic_office_management_system.models.Patient;
import com.ewan.clinic_office_management_system.services.PatientService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.web.bind.annotation.PostMapping;

@RestController
@RequestMapping("/patients")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @PostMapping("/register")
    public ResponseEntity<PatientDto> createPatient(@RequestBody PatientDto patientDto) {
        PatientDto createdPatient = patientService.createPatient(patientDto);
        return new ResponseEntity<>(createdPatient, HttpStatus.CREATED);
    }

    @GetMapping
    public List<PatientBasicDto> getAllPatients() {
        return patientService.getAllPatients();
    }

    @GetMapping("/view/{id}")
    public ResponseEntity<PatientDto> getPatientById(@PathVariable int id) {
        PatientDto patient = patientService.getPatientById(id);
        return ResponseEntity.ok(patient);
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<PatientDto> updatePatient(@PathVariable int id, @RequestBody Patient updatedPatient) {
        PatientDto existingPatient = patientService.getPatientById(id);
        if (updatedPatient.getFirstName() != null) {
            existingPatient.setFirstName(updatedPatient.getFirstName());
        }
        if (updatedPatient.getLastName() != null) {
            existingPatient.setLastName(updatedPatient.getLastName());
        }
        if (updatedPatient.getPhoneNumber() != null) {
            existingPatient.setPhoneNumber(updatedPatient.getPhoneNumber());
        }
        if (updatedPatient.getEmail() != null) {
            existingPatient.setEmail(updatedPatient.getEmail());
        }
        if (updatedPatient.getHealthInsuranceNumber() != 0) {
            existingPatient.setHealthInsuranceNumber(updatedPatient.getHealthInsuranceNumber());
        }
        if (updatedPatient.getAge() != 0) {
            existingPatient.setAge(updatedPatient.getAge());
        }
        if (updatedPatient.getGender() != null) {
            existingPatient.setGender(updatedPatient.getGender());
        }
        if (updatedPatient.getHistory() != null) {
            existingPatient.setHistory(updatedPatient.getHistory());
        }
        PatientDto savedPatient = patientService.updatePatient(existingPatient);
        return ResponseEntity.ok(savedPatient);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deletePatient(@PathVariable("id") int id) {
        Map<String, String> response = new HashMap<>();
        try {
            patientService.deletePatientById(id);
            response.put("message", "Patient with ID " + id + " deleted successfully");
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<Map<String, String>>(
                    Map.of("error",
                            e.getMessage() + " " + HttpStatus.NOT_FOUND.value() + " "
                                    + HttpStatus.NOT_FOUND.getReasonPhrase()),
                    HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error",
                    "An error occurred"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
