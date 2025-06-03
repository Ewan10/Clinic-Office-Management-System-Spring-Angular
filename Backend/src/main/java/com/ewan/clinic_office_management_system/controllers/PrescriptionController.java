package com.ewan.clinic_office_management_system.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ewan.clinic_office_management_system.dto.PrescriptionDto;
import com.ewan.clinic_office_management_system.services.PrescriptionService;

@RestController
@RequestMapping("patients/view/{patientId}/prescriptions")
public class PrescriptionController {
    @Autowired
    private PrescriptionService prescriptionService;

    @PostMapping
    public ResponseEntity<PrescriptionDto> createPrescription(
            @PathVariable int patientId,
            @RequestBody PrescriptionDto prescriptionDto) {
        PrescriptionDto prescription = prescriptionService.createPrescription(patientId, prescriptionDto);
        return new ResponseEntity<>(prescription, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PrescriptionDto>> getAllPrescriptions(
            @PathVariable int patientId) {
        List<PrescriptionDto> prescriptions = prescriptionService.getAllPrescriptions(patientId);
        return ResponseEntity.ok(prescriptions);
    }

}
