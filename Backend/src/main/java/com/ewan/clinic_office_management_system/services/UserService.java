package com.ewan.clinic_office_management_system.services;

import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;
import com.ewan.clinic_office_management_system.exceptions.common.BadRequestException;
import com.ewan.clinic_office_management_system.models.User;
import com.ewan.clinic_office_management_system.repositories.UserRepository;

@Service
public class UserService {
    @Autowired
    private final UserRepository userRepository;
    @Autowired
    private final PasswordEncoder passwordEncoder;
    @Autowired
    AuthenticationManager authenticationManager;
    @Autowired
    private JWTService jwtService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
            JWTService jwtService,
            AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public ResponseEntity<Map<String, Object>> signUp(@RequestBody User user) {
        if (user.getUserName() == null || user.getEmail() == null || user.getPassword() == null) {
            throw new BadRequestException("All fields (username, email, password) are required.");
        }
        if (userRepository.existsByUserName(user.getUserName())) {
            throw new BadRequestException("Username already exists.");
        }
        Map<String, Object> response = new HashMap<>();

        String token = jwtService.generateToken(user.getUserName());
        try {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            userRepository.save(user);
            response.put("userName", user.getUserName());
            response.put("token", token);
            response.put("expiresIn", 8 * 60 * 60 * 1000);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    public ResponseEntity<Map<String, Object>> login(User user) {
        Map<String, Object> response = new HashMap<>();
        try {
            Authentication authentication = authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(user.getUserName(), user.getPassword()));
            if (authentication.isAuthenticated()) {
                String token = jwtService.generateToken(user.getUserName());
                response.put("token", token);
                response.put("userName", user.getUserName());
                response.put("expiresIn", 8 * 60 * 60 * 1000);
                return ResponseEntity.ok(response);
            } else {
                response.put("body", "Invalid username or password");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            response.put("body", "Invalid username or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
}
