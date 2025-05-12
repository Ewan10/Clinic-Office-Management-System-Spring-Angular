package com.ewan.clinic_office_management_system.models;

import java.util.UUID;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "personnel")
public class User {

    @Id
    @Column(length = 36, unique = true, nullable = false)
    private String id;

    @PrePersist
    public void generateUUID() {
        if (id == null || id.isEmpty()) {
            id = UUID.randomUUID().toString();
        }
    }

    @Column(nullable = false, unique = true)
    private String userName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;
}
