package com.ewan.clinic_office_management_system.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ewan.clinic_office_management_system.models.Prescription;

public interface PrescriptionRepository extends JpaRepository<Prescription, Integer> {
    List<Prescription> findByPatientId(int patientId);
}
