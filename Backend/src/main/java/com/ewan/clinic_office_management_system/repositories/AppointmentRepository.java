package com.ewan.clinic_office_management_system.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.ewan.clinic_office_management_system.models.Appointment;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {

}
