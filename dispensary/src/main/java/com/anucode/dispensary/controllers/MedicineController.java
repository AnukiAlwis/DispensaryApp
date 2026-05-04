package com.anucode.dispensary.controllers;

import com.anucode.dispensary.config.TenantContext;
import com.anucode.dispensary.dtos.MedicineRequestDto;
import com.anucode.dispensary.dtos.MedicineResponseDto;
import com.anucode.dispensary.services.MedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/medicines")
@RequiredArgsConstructor
public class MedicineController {

    private final MedicineService medicineService;

    @PostMapping
    public ResponseEntity<UUID> addMedicine(@Valid @RequestBody MedicineRequestDto request) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        UUID createdById = TenantContext.getCurrentUser();

        UUID medicineId = medicineService.addMedicine(tenantId, request, createdById);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(medicineId)
                .toUri();

        return ResponseEntity.created(location).body(medicineId);
    }

    @GetMapping
    public ResponseEntity<List<MedicineResponseDto>> listMedicines() {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        return ResponseEntity.ok(medicineService.listMedicines(tenantId));
    }
}
