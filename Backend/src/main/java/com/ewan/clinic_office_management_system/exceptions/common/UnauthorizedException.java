package com.ewan.clinic_office_management_system.exceptions.common;

public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}