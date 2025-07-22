package com.ewan.clinic_office_management_system.controllers;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import org.springframework.http.MediaType;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

import com.ewan.clinic_office_management_system.dto.PatientBasicDto;
import com.ewan.clinic_office_management_system.dto.PatientDto;
import com.ewan.clinic_office_management_system.exceptions.common.ResourceNotFoundException;
import com.ewan.clinic_office_management_system.models.Patient;
import com.ewan.clinic_office_management_system.services.JWTService;
import com.ewan.clinic_office_management_system.services.PatientService;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@WebMvcTest(PatientController.class)
@AutoConfigureMockMvc
@Import(PatientControllerTest.TestSecurityConfig.class)
public class PatientControllerTest {

    @MockBean
    private PatientService patientService;
    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private JWTService jwtService;

    @Autowired
    private ObjectMapper objectMapper;
    private PatientDto patientDto;

    @BeforeEach
    void setUp() {
        patientDto = new PatientDto();
        patientDto.setId(1);
        patientDto.setFirstName("Sergio");
        patientDto.setLastName("Ramos");
        patientDto.setPhoneNumber("123454-220");
        patientDto.setEmail("sergio@mail.es");
        patientDto.setHealthInsuranceNumber(1823882100);
        patientDto.setAge(66);
        patientDto.setGender("Male");
        patientDto.setHistory("");
        patientDto.setPrescriptions(List.of());
    }

    @TestConfiguration
    public static class TestSecurityConfig {
        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http.csrf(csrf -> csrf.disable())
                    .authorizeHttpRequests(requests -> requests
                            .anyRequest().permitAll());
            return http.build();
        }
    }

    @Test
    void shouldCreatePatientSuccessfully() throws Exception {
        when(patientService.createPatient(any(PatientDto.class))).thenReturn(patientDto);

        mockMvc.perform(post("/patients/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(patientDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.firstName").value("Sergio"));
    }

    @Test
    void shouldFailCreatePatient() throws Exception {
        when(patientService.createPatient(any(PatientDto.class)))
                .thenThrow(new IllegalArgumentException("Invalid patient data"));

        mockMvc.perform(post("/patients/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(patientDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturnAllPatients() throws Exception {
        List<PatientBasicDto> patients = List.of(
                new PatientBasicDto(1, "Sergio", "Ramos", "123-456-7890", "sergio@mail.es", 123456789L, 35),
                new PatientBasicDto(2, "Andres", "Iniesta", "987-654-3210", "andres@mail.es", 987654321L, 34));

        when(patientService.getAllPatients()).thenReturn(patients);
        mockMvc.perform(get("/patients")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].firstName").value("Sergio"))
                .andExpect(jsonPath("$[1].lastName").value("Iniesta"));
    }

    @Test
    void shouldFailGetAllPatients() throws Exception {
        when(patientService.getAllPatients()).thenThrow(new RuntimeException("Database error"));
        mockMvc.perform(get("/patients"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void shouldReturnPatientByIdSuccessfully() throws Exception {
        int patientId = 1;
        when(patientService.getPatientById(patientId)).thenReturn(patientDto);
        mockMvc.perform(get("/patients/view/{id}", patientId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(patientId))
                .andExpect(jsonPath("$.firstName").value("Sergio"))
                .andExpect(jsonPath("$.lastName").value("Ramos"));
    }

    @Test
    void shouldReturnNotFoundWhenPatientDoesNotExist() throws Exception {
        int invalidId = 99;
        when(patientService.getPatientById(invalidId)).thenThrow(new ResourceNotFoundException("Patient not found"));
        mockMvc.perform(get("/patients/view/{id}", invalidId))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldUpdatePatientSuccessfully() throws Exception {
        int id = 1;

        Patient updatedPatient = new Patient();
        updatedPatient.setFirstName("Updated");
        updatedPatient.setLastName("Patient");
        updatedPatient.setPhoneNumber("111-222");
        updatedPatient.setEmail("updated@example.com");
        updatedPatient.setHealthInsuranceNumber(999999999);
        updatedPatient.setAge(45);
        updatedPatient.setGender("Other");
        updatedPatient.setHistory("Updated history");
        updatedPatient.setPrescriptions(List.of());

        PatientDto savedPatient = new PatientDto();
        savedPatient.setId(id);
        savedPatient.setFirstName("Updated");
        savedPatient.setLastName("Patient");
        updatedPatient.setPhoneNumber("111-222");
        updatedPatient.setEmail("updated@example.com");
        updatedPatient.setHealthInsuranceNumber(999999999);
        updatedPatient.setAge(45);
        updatedPatient.setGender("Other");
        updatedPatient.setHistory("Updated history");
        updatedPatient.setPrescriptions(List.of());

        when(patientService.getPatientById(id)).thenReturn(patientDto);
        when(patientService.updatePatient(any(PatientDto.class))).thenReturn(savedPatient);

        mockMvc.perform(put("/patients/edit/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedPatient)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Updated"))
                .andExpect(jsonPath("$.lastName").value("Patient"));
    }

    @Test
    void shouldReturnNotFoundWhenUpdatingNonExistentPatient() throws Exception {
        int invalidId = 99;
        Patient updatedPatient = new Patient();
        updatedPatient.setFirstName("Ghost");

        when(patientService.getPatientById(invalidId))
                .thenThrow(new ResourceNotFoundException("Patient not found"));

        mockMvc.perform(put("/patients/edit/{id}", invalidId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedPatient)))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldDeletePatientSuccessfully() throws Exception {
        int id = 1;
        mockMvc.perform(delete("/patients/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Patient with ID " + id + " deleted successfully"));
    }

    @Test
    void shouldReturnNotFoundWhenDeletingNonExistentPatient() throws Exception {
        int invalidId = 99;
        doThrow(new EntityNotFoundException("Patient not found"))
                .when(patientService).deletePatientById(invalidId);

        mockMvc.perform(delete("/patients/{id}", invalidId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Patient not found 404 Not Found"));
    }

}
