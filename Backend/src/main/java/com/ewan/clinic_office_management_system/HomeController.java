package com.ewan.clinic_office_management_system;

import org.springframework.web.bind.annotation.RestController;

// import jakarta.servlet.http.HttpServletRequest;

// import org.springframework.context.annotation.Bean;
// import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
// import org.springframework.security.web.server.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.security.authentication.AuthenticationManager;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "Welcome to the Clinic Office Management System!";
    }

    // @Bean
    // public AuthenticationManager
    // AuthenticationManager(AuthenticationConfiguration configuration) throws
    // Exception {
    // return configuration.getAuthenticationManager();
    // }

    // @GetMapping("/csrf-token")
    // public CsrfToken getCsrfToken(HttpServletRequest request) {
    // return (CsrfToken) request.getAttribute("_csrf");
    // }

}
