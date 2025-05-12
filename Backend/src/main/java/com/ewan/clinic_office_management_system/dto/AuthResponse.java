package com.ewan.clinic_office_management_system.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {
    private String email;
    private String token;
    private long expiresIn;
}
