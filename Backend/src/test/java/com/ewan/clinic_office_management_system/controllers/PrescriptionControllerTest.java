package com.ewan.clinic_office_management_system.controllers;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import java.util.List;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import com.ewan.clinic_office_management_system.dto.PrescriptionDto;
import com.ewan.clinic_office_management_system.exceptions.GlobalExceptionHandler;
import com.ewan.clinic_office_management_system.exceptions.common.ResourceNotFoundException;
import com.ewan.clinic_office_management_system.services.JWTService;
import com.ewan.clinic_office_management_system.services.PrescriptionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(PrescriptionController.class)
@AutoConfigureMockMvc
@Import({ PrescriptionControllerTest.TestSecurityConfig.class, GlobalExceptionHandler.class })
public class PrescriptionControllerTest {
    @SuppressWarnings("removal")
    @MockBean
    private PrescriptionService prescriptionService;

    @Autowired
    private MockMvc mockMvc;
    @SuppressWarnings("removal")
    @MockBean
    private JWTService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    private PrescriptionDto prescriptionDto;

    @BeforeEach
    void setUp() {
        prescriptionDto = new PrescriptionDto();
        prescriptionDto.setId(1);
        prescriptionDto.setMedicines(new String[] { "Ibuprofen" });
        prescriptionDto.setDiagnosis("Cold");
        prescriptionDto.setDate("2023-10-01");
    }

    @TestConfiguration
    public static class TestSecurityConfig {
        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http.csrf(csrf -> csrf.disable())
                    .authorizeHttpRequests(requests -> requests.anyRequest().permitAll());
            return http.build();
        }
    }

    @Test
    void shouldCreatePrescriptionSuccessfully() throws Exception {
        int patientId = 42;
        when(prescriptionService.createPrescription(eq(patientId), any(PrescriptionDto.class)))
                .thenReturn(prescriptionDto);
        mockMvc.perform(post("/patients/view/{patientId}/prescriptions", patientId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(prescriptionDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.medicines[0]").value("Ibuprofen"))
                .andExpect(jsonPath("$.diagnosis").value("Cold"))
                .andExpect(jsonPath("$.date").value("2023-10-01"));
    }

    @Test
    void shouldFailToCreatePrescriptionWhenPatientNotFound() throws Exception {
        int nonExistentPatientId = 999;

        when(prescriptionService.createPrescription(eq(nonExistentPatientId), any(PrescriptionDto.class)))
                .thenThrow(new ResourceNotFoundException("Patient with ID 999 not found"));

        mockMvc.perform(post("/patients/view/{patientId}/prescriptions", nonExistentPatientId)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(prescriptionDto)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Patient with ID 999 not found"));
    }

    @Test
    void shouldReturnAllPrescriptionsForPatient() throws Exception {
        int patientId = 42;
        PrescriptionDto p1 = new PrescriptionDto(1, "2025-07-23", "Flu", new String[] { "Ibuprofen" });
        PrescriptionDto p2 = new PrescriptionDto(2, "2025-07-21", "Infection", new String[] { "Amoxicillin" });
        List<PrescriptionDto> prescriptionList = List.of(p1, p2);
        when(prescriptionService.getAllPrescriptions(patientId)).thenReturn(prescriptionList);

        mockMvc.perform(get("/patients/view/{patientId}/prescriptions", patientId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].diagnosis").value("Flu"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].medicines[0]").value("Amoxicillin"));
    }

    @Test
    void shouldReturnEmptyListWhenNoPrescriptionsExist() throws Exception {
        int patientId = 77;
        when(prescriptionService.getAllPrescriptions(patientId)).thenReturn(List.of());
        mockMvc.perform(get("/patients/view/{patientId}/prescriptions", patientId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

}
