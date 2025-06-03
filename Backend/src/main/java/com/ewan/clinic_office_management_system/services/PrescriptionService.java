package com.ewan.clinic_office_management_system.services;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ewan.clinic_office_management_system.dto.PrescriptionDto;
import com.ewan.clinic_office_management_system.exceptions.common.BadRequestException;
import com.ewan.clinic_office_management_system.models.Patient;
import com.ewan.clinic_office_management_system.models.Prescription;
import com.ewan.clinic_office_management_system.repositories.PatientRepository;
import com.ewan.clinic_office_management_system.repositories.PrescriptionRepository;
import com.ewan.clinic_office_management_system.utils.DateUtils;
import jakarta.persistence.EntityNotFoundException;

@Service
public class PrescriptionService {
    @Autowired
    private PrescriptionRepository prescriptionRepository;
    private PatientRepository patientRepository;
    private final DateTimeFormatter formatter = DateUtils.DATE_FORMATTER;

    public PrescriptionService(PrescriptionRepository prescriptionRepository,
            PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
        this.prescriptionRepository = prescriptionRepository;
    }

    public List<PrescriptionDto> getAllPrescriptions(int patientId) {
        try {
            List<Prescription> prescriptions = prescriptionRepository.findByPatientId(patientId);
            return prescriptions.stream()
                    .map(prescription -> new PrescriptionDto(
                            prescription.getId(),
                            prescription.getDate().format(formatter),
                            prescription.getDiagnosis(),
                            prescription.getMedicines()))
                    .collect(Collectors.toList());
        } catch (Exception ex) {
            throw new RuntimeException("Failed to retrieve prescriptions: " + ex.getMessage());
        }
    }

    public PrescriptionDto createPrescription(int patientId, PrescriptionDto prescriptionDto) {
        if (prescriptionDto.getDate() == null || prescriptionDto.getDiagnosis() == null
                || prescriptionDto.getMedicines() == null) {
            throw new BadRequestException("Failed to create prescription. Fill in all the fields.");
        }
        try {
            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new EntityNotFoundException("Patient not found"));

            Prescription prescription = convertToEntity(prescriptionDto);
            prescription.setPatient(patient);
            Prescription savedPrescription = prescriptionRepository.save(prescription);

            return convertToDto(savedPrescription);
        } catch (Exception ex) {
            throw new BadRequestException("Failed to create prescription: " + ex.getMessage());
        }
    }

    private Prescription convertToEntity(PrescriptionDto dto) {
        Prescription prescription = new Prescription();
        prescription.setDate(LocalDate.parse(dto.getDate(), formatter));
        prescription.setDiagnosis(dto.getDiagnosis());
        prescription.setMedicines(dto.getMedicines());
        return prescription;
    }

    private PrescriptionDto convertToDto(Prescription prescription) {
        PrescriptionDto dto = new PrescriptionDto();
        dto.setId(prescription.getId());
        dto.setDate(prescription.getDate().format(formatter));
        dto.setDiagnosis(prescription.getDiagnosis());
        dto.setMedicines(prescription.getMedicines());
        return dto;
    }
}
