package com.ewan.clinic_office_management_system.services;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.ewan.clinic_office_management_system.dto.PrescriptionDto;
import com.ewan.clinic_office_management_system.models.Patient;
import com.ewan.clinic_office_management_system.models.Prescription;
import com.ewan.clinic_office_management_system.repositories.PatientRepository;
import com.ewan.clinic_office_management_system.repositories.PrescriptionRepository;

@ExtendWith(MockitoExtension.class)
public class PrescriptionServiceTest {
    @Mock
    private PatientRepository patientRepository;
    @Mock
    private PrescriptionRepository prescriptionRepository;
    @InjectMocks
    private PrescriptionService prescriptionService;

    private Prescription prescription1;
    private Prescription prescription2;
    private Patient mockPatient;
    private PrescriptionDto prescriptionDto;

    @BeforeEach
    void setUp() {
        mockPatient = new Patient();
        mockPatient.setId(100);
        mockPatient.setFirstName("Sergio");

        prescription1 = new Prescription();
        prescription1.setId(1);
        prescription1.setDate(LocalDate.of(2025, 7, 15));
        prescription1.setDiagnosis("Flu");
        prescription1.setMedicines(new String[] { "Tamiflu" });
        prescription1.setPatient(mockPatient);

        prescription2 = new Prescription();
        prescription2.setId(2);
        prescription2.setDate(LocalDate.of(2024, 3, 10));
        prescription2.setDiagnosis("Cold");
        prescription2.setMedicines(new String[] { "Depon" });
    }

    @Test
    void shouldReturnAllPrescriptionsForPatient() {
        int patientId = 100;
        List<Prescription> mockPrescriptions = List.of(prescription1, prescription2);
        when(prescriptionRepository.findByPatientId(patientId)).thenReturn(mockPrescriptions);
        List<PrescriptionDto> result = prescriptionService.getAllPrescriptions(patientId);
        assertEquals(2, result.size());

        PrescriptionDto dto1 = result.get(0);
        assertEquals(1, dto1.getId());
        assertEquals("2025-07-15", dto1.getDate());
        assertEquals("Flu", dto1.getDiagnosis());
        assertArrayEquals(new String[] { "Tamiflu" }, dto1.getMedicines());

        PrescriptionDto dto2 = result.get(1);
        assertEquals(2, dto2.getId());
        assertEquals("2024-03-10", dto2.getDate());
        assertEquals("Cold", dto2.getDiagnosis());
        assertArrayEquals(new String[] { "Depon" }, dto2.getMedicines());

        verify(prescriptionRepository, times(1)).findByPatientId(patientId);
    }

    @Test
    void shouldCreatePrescriptionSuccessfully() {
        prescriptionDto = new PrescriptionDto();
        prescriptionDto.setDate("2025-07-15");
        prescriptionDto.setDiagnosis("Flu");
        prescriptionDto.setMedicines(new String[] { "Tamiflu" });

        when(patientRepository.findById(100)).thenReturn(Optional.of(mockPatient));
        when(prescriptionRepository.save(any(Prescription.class))).thenReturn(prescription1);
        PrescriptionDto result = prescriptionService.createPrescription(100, prescriptionDto);

        assertEquals("Flu", result.getDiagnosis());
        assertEquals("2025-07-15", result.getDate());
        assertArrayEquals(new String[] { "Tamiflu" }, result.getMedicines());
        verify(patientRepository).findById(100);
        verify(prescriptionRepository).save(any(Prescription.class));
    }

}
