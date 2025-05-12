package com.ewan.clinic_office_management_system.controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ewan.clinic_office_management_system.dto.AppointmentDto;
import com.ewan.clinic_office_management_system.services.AppointmentService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @PostMapping("/makeAppointment")
    public ResponseEntity<AppointmentDto> createAppointment(@RequestBody AppointmentDto appointmentDto) {
        AppointmentDto createdAppointment = appointmentService.createAppointment(appointmentDto);
        return new ResponseEntity<>(createdAppointment, HttpStatus.CREATED);
    }

    @GetMapping
    public List<AppointmentDto> getAppointments() {
        return appointmentService.getAllAppointments();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDto> getAppointmentById(@PathVariable int id) {
        AppointmentDto appointmentDto = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(appointmentDto);
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<AppointmentDto> updateAppointment(@PathVariable int id,
            @RequestBody AppointmentDto appointmentDto) {
        AppointmentDto updatedAppointment = appointmentService.updateAppointment(id, appointmentDto);
        return new ResponseEntity<>(updatedAppointment, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteAppointment(@PathVariable("id") int id) {
        Map<String, String> response = new HashMap<>();
        appointmentService.deleteAppointmentById(id);
        response.put("message", "Appointment with ID " + id + " deleted successfully");
        return ResponseEntity.ok(response);
    }
}
