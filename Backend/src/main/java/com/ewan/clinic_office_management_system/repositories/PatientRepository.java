package com.ewan.clinic_office_management_system.repositories;

import com.ewan.clinic_office_management_system.models.Patient;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientRepository extends JpaRepository<Patient, Integer> {
    Optional<Patient> findByFirstNameAndLastName(String firstName, String lastName);

}
