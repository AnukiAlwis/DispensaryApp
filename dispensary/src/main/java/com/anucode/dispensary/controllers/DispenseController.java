package com.anucode.dispensary.controllers;

import com.anucode.dispensary.config.TenantContext;
import com.anucode.dispensary.dtos.DispenseRequestDto;
import com.anucode.dispensary.dtos.DispenseResponseDto;
import com.anucode.dispensary.services.DispenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/dispense")
@RequiredArgsConstructor
public class DispenseController {

    private final DispenseService dispenseService;

    @PostMapping
    public ResponseEntity<UUID> recordDispense(@Valid @RequestBody DispenseRequestDto request) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        UUID currentUser = TenantContext.getCurrentUser();

        UUID dispenseId = dispenseService.recordDispense(tenantId, currentUser, request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(dispenseId)
                .toUri();

        return ResponseEntity.created(location).body(dispenseId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DispenseResponseDto> getDispense(@PathVariable UUID id) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        return ResponseEntity.ok(dispenseService.getDispenseById(tenantId, id));
    }
}
