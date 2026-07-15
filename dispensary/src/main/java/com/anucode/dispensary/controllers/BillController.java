package com.anucode.dispensary.controllers;

import com.anucode.dispensary.config.TenantContext;
import com.anucode.dispensary.dtos.*;
import com.anucode.dispensary.services.BillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;

    @PostMapping
    public ResponseEntity<UUID> createBill(@Valid @RequestBody BillCreateDto request) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        UUID currentUser = TenantContext.getCurrentUser();

        UUID billId = billService.createBill(tenantId, currentUser, request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(billId)
                .toUri();

        return ResponseEntity.created(location).body(billId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillResponseDto> getBill(@PathVariable UUID id) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        return ResponseEntity.ok(billService.getBill(tenantId, id));
    }

    @PostMapping("/{id}/calculate")
    public ResponseEntity<BillResponseDto> calculate(@PathVariable UUID id) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        UUID currentUser = TenantContext.getCurrentUser();
        return ResponseEntity.ok(billService.calculateBill(tenantId, currentUser, id));
    }

    @PutMapping("/{id}/discounts")
    public ResponseEntity<BillResponseDto> updateDiscounts(@PathVariable UUID id,
                                                           @Valid @RequestBody BillDiscountUpdateDto request) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        UUID currentUser = TenantContext.getCurrentUser();
        return ResponseEntity.ok(billService.updateDiscounts(tenantId, currentUser, id, request));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<BillResponseDto> updateStatus(@PathVariable UUID id,
                                                        @Valid @RequestBody BillStatusUpdateDto request) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        UUID currentUser = TenantContext.getCurrentUser();
        return ResponseEntity.ok(billService.updateStatus(tenantId, currentUser, id, request));
    }

    // optional: list by patient; not used per previous note but implemented for completeness
    @GetMapping
    public ResponseEntity<?> listOrLookup(@RequestParam(required = false) UUID patientId,
                                          @RequestParam(required = false) UUID prescriptionId) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        if (prescriptionId != null) {
            return ResponseEntity.ok(billService.getBillByPrescriptionId(tenantId, prescriptionId));
        }
        if (patientId == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(billService.listBillsByPatient(tenantId, patientId));
    }
}
