package com.anucode.dispensary.controllers;

import com.anucode.dispensary.config.TenantContext;
import com.anucode.dispensary.dtos.PatientRequestDto;
import com.anucode.dispensary.dtos.PatientResponseDto;
import com.anucode.dispensary.services.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @PostMapping
    public ResponseEntity<String> createPatient(@Valid @RequestBody PatientRequestDto request) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        UUID createdById = TenantContext.getCurrentUser();
        String patientId = patientService.createPatient(tenantId, request, createdById);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(patientId)
                .toUri();

        return ResponseEntity.created(location).body(patientId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientResponseDto> getPatient(@PathVariable UUID id) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        return ResponseEntity.ok(patientService.getPatientById(tenantId, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientResponseDto> updatePatient(@PathVariable UUID id,
                                                            @Valid @RequestBody PatientRequestDto request) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        return ResponseEntity.ok(patientService.updatePatient(tenantId, id, request));
    }

    @GetMapping
    public ResponseEntity<List<PatientResponseDto>> searchPatients(@RequestParam String search) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        return ResponseEntity.ok(patientService.searchPatients(tenantId, search));
    }
}
