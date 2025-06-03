package com.ewan.clinic_office_management_system.dto;

import java.util.List;

import com.ewan.clinic_office_management_system.models.Prescription;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PatientDto {
    private Integer id;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String email;
    private long healthInsuranceNumber;
    private int age;
    private String gender;
    private String history;
    private List<Prescription> prescriptions;

}
