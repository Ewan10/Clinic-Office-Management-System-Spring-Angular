package com.ewan.clinic_office_management_system.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ewan.clinic_office_management_system.dto.AppointmentDto;
import com.ewan.clinic_office_management_system.exceptions.common.BadRequestException;
import com.ewan.clinic_office_management_system.models.Appointment;
import com.ewan.clinic_office_management_system.models.Patient;
import com.ewan.clinic_office_management_system.repositories.AppointmentRepository;
import com.ewan.clinic_office_management_system.repositories.PatientRepository;
import com.ewan.clinic_office_management_system.utils.DateUtils;
import jakarta.persistence.EntityNotFoundException;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private PatientRepository patientRepository;

    public AppointmentService(AppointmentRepository appointmentRepository, PatientRepository patientRepository) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
    }

    public AppointmentDto createAppointment(AppointmentDto appointmentDto) {
        if (appointmentDto.getDate() == null || appointmentDto.getTime() == null ||
                appointmentDto.getRoom() == null || appointmentDto.getDoctor() == null) {
            throw new BadRequestException("Failed to create appointment. Fill in all the fields.");
        }
        try {
            Appointment appointment = convertToEntity(appointmentDto);
            Appointment savedAppointment = appointmentRepository.save(appointment);
            return convertToDto(savedAppointment);
        } catch (Exception ex) {
            throw new BadRequestException("Failed to create appointment: " + ex.getMessage());
        }
    }

    private Appointment convertToEntity(AppointmentDto dto) {
        Appointment appointment = new Appointment();
        DateTimeFormatter dateFormatter = DateUtils.DATE_FORMATTER;
        DateTimeFormatter timeFormatter = DateUtils.TIME_FORMATTER;
        LocalDate date = LocalDate.parse(dto.getDate(), dateFormatter);
        LocalTime time = LocalTime.parse(dto.getTime(), timeFormatter);
        LocalDateTime dateTime = LocalDateTime.of(date, time);
        appointment.setDate(dateTime);
        appointment.setRoom(dto.getRoom());
        appointment.setDoctor(dto.getDoctor());

        Optional<Patient> patient = patientRepository.findByFirstNameAndLastName(dto.getPatientFirstName(),
                dto.getPatientLastName());

        patient.ifPresentOrElse(appointment::setPatient,
                () -> {
                    throw new EntityNotFoundException(
                            "Patient " + dto.getPatientFirstName() + " " + dto.getPatientLastName() + " not found");
                });
        return appointment;
    }

    public List<AppointmentDto> getAllAppointments() {
        try {
            List<Appointment> appointments = appointmentRepository.findAll();
            return appointments.stream().map(appointment -> {
                String formattedDate = DateUtils.formatAppointmentDate(appointment);
                String formattedTime = DateUtils.formatAppointmentTime(appointment);
                return new AppointmentDto(
                        appointment.getId(),
                        formattedDate,
                        formattedTime,
                        appointment.getRoom(),
                        appointment.getDoctor(),
                        appointment.getPatient().getFirstName(),
                        appointment.getPatient().getLastName());
            }).collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch appointments: " + e.getMessage());
        }
    }

    private AppointmentDto convertToDto(Appointment appointment) {
        AppointmentDto dto = new AppointmentDto();
        String formattedDate = DateUtils.formatAppointmentDate(appointment);
        dto.setId(appointment.getId());
        dto.setDate(formattedDate);
        dto.setTime(DateUtils.formatAppointmentTime(appointment));
        dto.setDoctor(appointment.getDoctor());
        dto.setRoom(appointment.getRoom());
        dto.setPatientFirstName(appointment.getPatient().getFirstName());
        dto.setPatientLastName(appointment.getPatient().getLastName());
        return dto;
    }

    public AppointmentDto getAppointmentById(int id) {
        return appointmentRepository.findById(id)
                .map(this::convertToDto)
                .orElseThrow(() -> new EntityNotFoundException("Appointment with ID " + id + " not found"));
    }

    public AppointmentDto updateAppointment(int id, AppointmentDto appointmentDto) {
        try {
            Optional<Appointment> existingAppointmentOptional = appointmentRepository.findById(id);
            if (existingAppointmentOptional.isPresent()) {
                Appointment existingAppointment = existingAppointmentOptional.get();
                DateTimeFormatter dateFormatter = DateUtils.DATE_FORMATTER;
                DateTimeFormatter timeFormatter = DateUtils.TIME_FORMATTER;

                LocalDate date = LocalDate.parse(appointmentDto.getDate(), dateFormatter);
                LocalTime time = LocalTime.parse(appointmentDto.getTime(), timeFormatter);
                LocalDateTime dateTime = LocalDateTime.of(date, time);

                existingAppointment.setDate(dateTime);
                existingAppointment.setRoom(appointmentDto.getRoom());
                existingAppointment.setDoctor(appointmentDto.getDoctor());

                Optional<Patient> patient = patientRepository.findByFirstNameAndLastName(
                        appointmentDto.getPatientFirstName(), appointmentDto.getPatientLastName());

                patient.ifPresentOrElse(existingAppointment::setPatient, () -> {
                    throw new EntityNotFoundException(
                            "Patient " + appointmentDto.getPatientFirstName() + " "
                                    + appointmentDto.getPatientLastName()
                                    + " not found");
                });
                Appointment updatedAppointment = appointmentRepository.save(existingAppointment);
                return convertToDto(updatedAppointment);
            } else {
                throw new EntityNotFoundException("Appointment with id " + id + " not found");
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to update appointment: " + e.getMessage());
        }
    }

    public void deleteAppointmentById(int id) {
        Optional<Appointment> appointment = appointmentRepository.findById(id);
        if (appointment.isPresent()) {
            appointmentRepository.deleteById(id);
        } else {
            throw new EntityNotFoundException("Appointment with ID " + id + " not found");
        }
    }
}
