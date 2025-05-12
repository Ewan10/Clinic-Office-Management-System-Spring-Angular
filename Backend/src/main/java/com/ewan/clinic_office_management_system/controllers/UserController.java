package com.ewan.clinic_office_management_system.controllers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import com.ewan.clinic_office_management_system.models.User;
import com.ewan.clinic_office_management_system.services.UserService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/signUp")
    public ResponseEntity<Map<String, Object>> signUp(@RequestBody User user) {
        return userService.signUp(user);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody User user) {
        return userService.login(user);
    }
}
