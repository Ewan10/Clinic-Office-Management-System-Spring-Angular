package com.ewan.clinic_office_management_system.utils;

import static org.junit.jupiter.api.Assertions.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import com.ewan.clinic_office_management_system.models.Appointment;

class DateUtilsTest {
    private Appointment appointment;

    @BeforeEach
    void setUp() {
        appointment = new Appointment();
    }

    @Test
    void shouldFormatAppointmentDateCorrectly() {
        appointment.setDate(LocalDateTime.of(2025, 7, 23, 10, 30));
        String formattedDate = DateUtils.formatAppointmentDate(appointment);
        assertEquals("2025-07-23", formattedDate);
    }

    @Test
    void shouldFormatAppointmentTimeCorrectly() {
        appointment.setDate(LocalDateTime.of(2025, 7, 23, 10, 30));
        String formattedTime = DateUtils.formatAppointmentTime(appointment);
        assertEquals("10:30", formattedTime);
    }

    @Test
    void shouldThrowExceptionIfAppointmentIsNullForDateFormatting() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> DateUtils.formatAppointmentDate(null));
        assertEquals("Appointment or its date cannot be null", ex.getMessage());
    }

    @Test
    void shouldThrowExceptionIfAppointmentDateIsNullForTimeFormatting() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> DateUtils.formatAppointmentTime(appointment));
        assertEquals("Appointment or its date cannot be null", ex.getMessage());
    }

    @Test
    void shouldReturnCorrectCustomFormatter() {
        DateTimeFormatter formatter = DateUtils.formatDateTime();
        String formatted = LocalDateTime.of(2025, 7, 23, 14, 15).format(formatter);
        assertEquals("23/07/2025 14:15", formatted);
    }
}
