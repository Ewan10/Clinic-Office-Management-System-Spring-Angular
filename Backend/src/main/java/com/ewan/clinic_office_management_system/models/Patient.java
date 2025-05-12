package com.ewan.clinic_office_management_system.models;

import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
@Table(name = "patients")
@Getter
@Setter
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;
    @Column(name = "firstName")
    private String firstName;
    @Column(name = "lastName")
    private String lastName;
    @Column(name = "phoneNumber")
    private String phoneNumber;
    @Column(name = "email")
    private String email;
    @Column(name = "healthInsuranceNumber")
    private long healthInsuranceNumber;
    @Column(name = "age")
    private int age;
    private String gender;
    private String history;
}
