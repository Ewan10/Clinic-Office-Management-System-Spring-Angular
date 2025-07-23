package com.ewan.clinic_office_management_system.controllers;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

import com.ewan.clinic_office_management_system.exceptions.GlobalExceptionHandler;
import com.ewan.clinic_office_management_system.models.User;
import com.ewan.clinic_office_management_system.services.JWTService;
import com.ewan.clinic_office_management_system.services.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(UserController.class)
@Import({ UserControllerTest.TestSecurityConfig.class, GlobalExceptionHandler.class })
public class UserControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;
    @SuppressWarnings("removal")
    @MockBean
    private UserService userService;
    @SuppressWarnings("removal")
    @MockBean
    private JWTService jwtService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUserName("testuser");
        testUser.setPassword("password123");
        testUser.setEmail("testuser@example.com");
    }

    @TestConfiguration
    public static class TestSecurityConfig {
        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http
                    .csrf(csrf -> csrf.disable())
                    .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            return http.build();
        }
    }

    @Test
    void shouldSignUpUserSuccessfully() throws Exception {
        Map<String, Object> successResponse = Map.of(
                "message", "User registered successfully",
                "userName", testUser.getUserName());
        when(userService.signUp(any(User.class))).thenReturn(ResponseEntity.ok(successResponse));
        mockMvc.perform(post("/signUp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User registered successfully"))
                .andExpect(jsonPath("$.userName").value(testUser.getUserName()));
    }

    @Test
    void shouldFailSignUpWithBadRequest() throws Exception {
        Map<String, Object> errorResponse = Map.of(
                "error", "Invalid user data",
                "message", "Email format is incorrect");
        when(userService.signUp(any(User.class)))
                .thenReturn(ResponseEntity.badRequest().body(errorResponse));
        mockMvc.perform(post("/signUp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUser)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid user data"))
                .andExpect(jsonPath("$.message").value("Email format is incorrect"));
    }

    @Test
    void shouldLoginUserSuccessfully() throws Exception {
        Map<String, Object> successResponse = Map.of(
                "message", "User logged in successfully",
                "userName", testUser.getUserName(),
                "token", "dummy-jwt-token");
        when(userService.login(any(User.class)))
                .thenReturn(ResponseEntity.ok(successResponse));
        mockMvc.perform(post("/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User logged in successfully"))
                .andExpect(jsonPath("$.userName").value(testUser.getUserName()))
                .andExpect(jsonPath("$.token").value("dummy-jwt-token"));
    }

    @Test
    void shouldFailLoginWithInvalidCredentials() throws Exception {
        Map<String, Object> errorResponse = Map.of(
                "message", "Invalid username or password");
        when(userService.login(any(User.class)))
                .thenReturn(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse));

        mockMvc.perform(post("/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUser)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }

}
