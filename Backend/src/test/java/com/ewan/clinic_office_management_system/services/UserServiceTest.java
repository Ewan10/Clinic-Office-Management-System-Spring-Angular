package com.ewan.clinic_office_management_system.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.ewan.clinic_office_management_system.exceptions.common.BadRequestException;
import com.ewan.clinic_office_management_system.models.User;
import com.ewan.clinic_office_management_system.repositories.UserRepository;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {
    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JWTService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserName("testUser");
        user.setEmail("test@example.com");
        user.setPassword("plainPassword");
    }

    @Test
    void shouldSignUpSuccessfully() {
        when(userRepository.existsByUserName("testUser")).thenReturn(false);
        when(passwordEncoder.encode("plainPassword")).thenReturn("hashedPassword");
        when(jwtService.generateToken("testUser")).thenReturn("mockToken");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<Map<String, Object>> response = userService.signUp(user);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals("testUser", body.get("userName"));
        assertEquals("mockToken", body.get("token"));
        assertEquals(8 * 60 * 60 * 1000, body.get("expiresIn"));
        verify(userRepository).save(any(User.class));
        verify(passwordEncoder).encode("plainPassword");
    }

    @Test
    void shouldThrowBadRequestExceptionWhenUsernameExists() {
        when(userRepository.existsByUserName("testUser")).thenReturn(true);
        assertThrows(BadRequestException.class, () -> userService.signUp(user));
    }

    @Test
    void shouldThrowBadRequestWhenMissingFields() {
        user.setUserName(null);
        assertThrows(BadRequestException.class, () -> userService.signUp(user));
    }

    @Test
    void shouldReturnInternalServerErrorOnException() {
        when(userRepository.existsByUserName("testUser")).thenReturn(false);
        when(passwordEncoder.encode("plainPassword")).thenReturn("hashedPassword");
        when(jwtService.generateToken("testUser")).thenReturn("mockToken");
        when(userRepository.save(any(User.class))).thenThrow(new RuntimeException("DB error"));

        ResponseEntity<Map<String, Object>> response = userService.signUp(user);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertTrue(response.getBody().isEmpty() || response.getBody() != null);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldLoginSuccessfully() {
        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(jwtService.generateToken("testUser")).thenReturn("mocked-jwt-token");
        ResponseEntity<Map<String, Object>> response = userService.login(user);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("mocked-jwt-token", response.getBody().get("token"));
        assertEquals("testUser", response.getBody().get("userName"));
        assertEquals(8 * 60 * 60 * 1000, response.getBody().get("expiresIn"));
        verify(authenticationManager, times(1)).authenticate(any(Authentication.class));
        verify(jwtService, times(1)).generateToken("testUser");
    }

    @Test
    void shouldReturnUnauthorizedWhenLoginFails() {
        when(authenticationManager.authenticate(any(Authentication.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));
        ResponseEntity<Map<String, Object>> response = userService.login(user);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Invalid username or password", response.getBody().get("body"));
        verify(authenticationManager,
                times(1)).authenticate(any(Authentication.class));
        verify(jwtService, never()).generateToken(anyString());
    }
}