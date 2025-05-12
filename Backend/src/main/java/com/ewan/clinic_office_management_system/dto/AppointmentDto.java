package com.ewan.clinic_office_management_system.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentDto {
    private int id;
    private String date;
    private String time;
    private Integer room;
    private String doctor;
    private String patientFirstName;
    private String patientLastName;
}
