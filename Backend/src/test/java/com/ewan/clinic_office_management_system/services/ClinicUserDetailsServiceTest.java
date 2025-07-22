package com.ewan.clinic_office_management_system.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.ewan.clinic_office_management_system.models.User;
import com.ewan.clinic_office_management_system.repositories.UserRepository;

@ExtendWith(MockitoExtension.class)
class ClinicUserDetailsServiceTest {
    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private ClinicUserDetailsService clinicUserDetailsService;

    @Test
    void shouldLoadUserByUsernameSuccessfully() {
        String userName = "john";
        User mockUser = new User();
        mockUser.setUserName(userName);
        mockUser.setPassword("secure-password");
        when(userRepository.findByUserName(userName)).thenReturn(Optional.of(mockUser));

        UserDetails userDetails = clinicUserDetailsService.loadUserByUsername(userName);
        assertEquals(userName, userDetails.getUsername());
        verify(userRepository, times(1)).findByUserName(userName);
    }

    @Test
    void shouldThrowExceptionWhenUserNotFound() {
        String userName = "nonexistent";
        when(userRepository.findByUserName(userName)).thenReturn(Optional.empty());
        assertThrows(UsernameNotFoundException.class, () -> {
            clinicUserDetailsService.loadUserByUsername(userName);
        });
        verify(userRepository, times(1)).findByUserName(userName);
    }

}
