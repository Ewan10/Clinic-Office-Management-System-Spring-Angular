package com.ewan.clinic_office_management_system.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.ewan.clinic_office_management_system.models.User;
import com.ewan.clinic_office_management_system.models.UserPrincipal;
import com.ewan.clinic_office_management_system.repositories.UserRepository;

@Service
public class ClinicUserDetailsService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String userName) throws UsernameNotFoundException {
        User user = userRepository.findByUserName(userName)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + userName));

        return new UserPrincipal(user);
    }
}
