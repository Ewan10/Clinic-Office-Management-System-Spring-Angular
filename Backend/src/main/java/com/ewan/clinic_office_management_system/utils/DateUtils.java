package com.ewan.clinic_office_management_system.utils;

import java.time.format.DateTimeFormatter;

import com.ewan.clinic_office_management_system.models.Appointment;

public class DateUtils {
    public static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    public static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    public static String formatAppointmentDate(Appointment appointment) {
        if (appointment == null || appointment.getDate() == null) {
            throw new IllegalArgumentException("Appointment or its date cannot be null");
        }
        return appointment.getDate().toLocalDate().format(DATE_FORMATTER);
    }

    public static String formatAppointmentTime(Appointment appointment) {
        if (appointment == null || appointment.getDate() == null) {
            throw new IllegalArgumentException("Appointment or its date cannot be null");
        }
        return appointment.getDate().toLocalTime().format(TIME_FORMATTER);
    }

    public static DateTimeFormatter formatDateTime() {
        return DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    }

}