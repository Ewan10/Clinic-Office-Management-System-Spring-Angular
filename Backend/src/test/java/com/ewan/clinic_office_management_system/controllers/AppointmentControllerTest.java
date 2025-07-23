package com.ewan.clinic_office_management_system.controllers;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import java.util.List;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import com.ewan.clinic_office_management_system.dto.AppointmentDto;
import com.ewan.clinic_office_management_system.exceptions.GlobalExceptionHandler;
import com.ewan.clinic_office_management_system.exceptions.common.ResourceNotFoundException;
import com.ewan.clinic_office_management_system.services.AppointmentService;
import com.ewan.clinic_office_management_system.services.JWTService;
import com.ewan.clinic_office_management_system.services.PatientService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(AppointmentController.class)
@AutoConfigureMockMvc
@Import({ AppointmentControllerTest.TestSecurityConfig.class, GlobalExceptionHandler.class })
public class AppointmentControllerTest {
    @SuppressWarnings("removal")
    @MockBean
    private AppointmentService appointmentService;
    @SuppressWarnings("removal")
    @MockBean
    private PatientService patientService;
    @SuppressWarnings("removal")
    @MockBean
    private JWTService jwtService;
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    private AppointmentDto appointmentDto;

    @BeforeEach
    void setUp() {
        appointmentDto = new AppointmentDto();
        appointmentDto.setId(1);
        appointmentDto.setDoctor("Dr Altogarcia");
        appointmentDto.setPatientFirstName("Alvaro");
        appointmentDto.setPatientLastName("Iniesta");
        appointmentDto.setRoom(101);
        appointmentDto.setDate("2025-07-25");
        appointmentDto.setTime("10:00");
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
    void shouldCreateAppointmentSuccessfully() throws Exception {
        when(appointmentService.createAppointment(any(AppointmentDto.class))).thenReturn(appointmentDto);
        mockMvc.perform(post("/appointments/makeAppointment")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(appointmentDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.doctor").value("Dr Altogarcia"))
                .andExpect(jsonPath("$.patientFirstName").value("Alvaro"))
                .andExpect(jsonPath("$.patientLastName").value("Iniesta"));
    }

    @Test
    void shouldReturnBadRequestWhenInvalidAppointment() throws Exception {
        AppointmentDto invalidDto = new AppointmentDto();
        when(appointmentService.createAppointment(any(AppointmentDto.class)))
                .thenThrow(new IllegalArgumentException("Invalid appointment"));

        mockMvc.perform(post("/appointments/makeAppointment")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturnListOfAppointmentsSuccessfully() throws Exception {
        List<AppointmentDto> appointments = List.of(
                new AppointmentDto(1, "2025-07-25", "10:00", 101, "Dr Altogarcia", "Alvaro", "Iniesta"),
                new AppointmentDto(2, "2025-07-26", "11:00", 102, "Dr Marco", "Eva", "Smith"));

        when(appointmentService.getAllAppointments()).thenReturn(appointments);

        mockMvc.perform(get("/appointments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].doctor").value("Dr Altogarcia"))
                .andExpect(jsonPath("$[1].patientFirstName").value("Eva"));
    }

    @Test
    void shouldReturnServerErrorWhenServiceFails() throws Exception {
        when(appointmentService.getAllAppointments())
                .thenThrow(new RuntimeException("Database failure"));

        mockMvc.perform(get("/appointments"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("Something went wrong."));
    }

    @Test
    void shouldReturnAppointmentByIdSuccessfully() throws Exception {
        int validId = 1;
        AppointmentDto appointment = new AppointmentDto(validId, "2025-07-25", "10:00", 101, "Dr Altogarcia", "Alvaro",
                "Iniesta");
        when(appointmentService.getAppointmentById(validId)).thenReturn(appointment);

        mockMvc.perform(get("/appointments/{id}", validId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.doctor").value("Dr Altogarcia"))
                .andExpect(jsonPath("$.patientFirstName").value("Alvaro"))
                .andExpect(jsonPath("$.patientLastName").value("Iniesta"));
    }

    @Test
    void shouldReturnNotFoundWhenAppointmentDoesNotExist() throws Exception {
        int invalidId = 99;
        when(appointmentService.getAppointmentById(invalidId))
                .thenThrow(new ResourceNotFoundException("Appointment not found"));

        mockMvc.perform(get("/appointments/{id}", invalidId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Appointment not found"));
    }

    @Test
    void shouldUpdateAppointmentSuccessfully() throws Exception {
        int id = 1;
        AppointmentDto updatedDto = new AppointmentDto(id, "2025-07-26", "11:00", 102, "Dr House", "Gregory", "Wilson");
        when(appointmentService.updateAppointment(eq(id), any(AppointmentDto.class))).thenReturn(updatedDto);

        mockMvc.perform(put("/appointments/edit/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.doctor").value("Dr House"))
                .andExpect(jsonPath("$.patientFirstName").value("Gregory"))
                .andExpect(jsonPath("$.patientLastName").value("Wilson"));
    }

    @Test
    void shouldReturnNotFoundWhenUpdatingNonexistentAppointment() throws Exception {
        int invalidId = 99;
        AppointmentDto inputDto = new AppointmentDto(invalidId, "2025-07-26", "11:00", 102, "Dr Strange", "Stephen",
                "Banner");
        when(appointmentService.updateAppointment(eq(invalidId), any(AppointmentDto.class)))
                .thenThrow(new ResourceNotFoundException("Appointment not found"));

        mockMvc.perform(put("/appointments/edit/{id}", invalidId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inputDto)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Appointment not found"));
    }

    @Test
    void shouldDeleteAppointmentSuccessfully() throws Exception {
        int id = 1;
        doNothing().when(appointmentService).deleteAppointmentById(id);

        mockMvc.perform(delete("/appointments/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Appointment with ID " + id + " deleted successfully"));
    }

    @Test
    void shouldReturnNotFoundWhenDeletingNonexistentAppointment() throws Exception {
        int invalidId = 999;
        doThrow(new ResourceNotFoundException("Appointment not found")).when(appointmentService)
                .deleteAppointmentById(invalidId);
        mockMvc.perform(delete("/appointments/{id}", invalidId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Appointment not found"));
    }

}
