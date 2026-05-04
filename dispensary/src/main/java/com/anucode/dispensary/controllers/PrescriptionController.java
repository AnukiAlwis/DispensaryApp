package com.anucode.dispensary.controllers;

import com.anucode.dispensary.config.TenantContext;
import com.anucode.dispensary.dtos.*;
import com.anucode.dispensary.services.PrescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @PostMapping
    public ResponseEntity<UUID> createPrescription(@Valid @RequestBody PrescriptionRequestDto request) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        UUID currentUserId = TenantContext.getCurrentUser();
        UUID prescriptionId = prescriptionService.createPrescription(tenantId, currentUserId, request);
        return ResponseEntity.ok(prescriptionId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrescriptionResponseDto> getPrescription(@PathVariable UUID id) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        return ResponseEntity.ok(prescriptionService.getPrescription(tenantId, id));
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<UUID> addPrescriptionItem(@PathVariable UUID id,
                                                    @Valid @RequestBody PrescriptionItemRequestDto request) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        UUID currentUserId = TenantContext.getCurrentUser();
        return ResponseEntity.ok(prescriptionService.addPrescriptionItem(tenantId, id, request, currentUserId));
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<List<PrescriptionItemResponseDto>> getPrescriptionItems(@PathVariable UUID id) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        return ResponseEntity.ok(prescriptionService.getPrescriptionItems(tenantId, id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<PrescriptionResponseDto> updatePrescriptionStatus(@PathVariable UUID id,
                                                                            @Valid @RequestBody PrescriptionStatusUpdateDto request) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        return ResponseEntity.ok(prescriptionService.updatePrescriptionStatus(tenantId, id, request.getStatus()));
    }
}

