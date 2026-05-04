package com.anucode.dispensary.controllers;

import com.anucode.dispensary.config.TenantContext;
import com.anucode.dispensary.dtos.DistributorRequestDto;
import com.anucode.dispensary.dtos.DistributorResponseDto;
import com.anucode.dispensary.services.DistributorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/distributors")
@RequiredArgsConstructor
public class DistributorController {

    private final DistributorService distributorService;

    @PostMapping
    public ResponseEntity<UUID> createDistributor(@Valid @RequestBody DistributorRequestDto request) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());

        UUID distributorId = distributorService.createDistributor(tenantId, request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(distributorId)
                .toUri();

        return ResponseEntity.created(location).body(distributorId);
    }

    @GetMapping
    public ResponseEntity<List<DistributorResponseDto>> listDistributors() {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        return ResponseEntity.ok(distributorService.listDistributors(tenantId));
    }
}
