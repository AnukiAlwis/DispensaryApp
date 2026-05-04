package com.anucode.dispensary.controllers;

import com.anucode.dispensary.config.TenantContext;
import com.anucode.dispensary.dtos.*;
import com.anucode.dispensary.services.SupplyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/supplies")
@RequiredArgsConstructor
public class SupplyController {

    private final SupplyService supplyService;

    @PostMapping
    public ResponseEntity<UUID> createSupply(@Valid @RequestBody SupplyRequestDto request) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        UUID currentUser = TenantContext.getCurrentUser();

        UUID supplyId = supplyService.createSupply(tenantId, currentUser, request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(supplyId)
                .toUri();

        return ResponseEntity.created(location).body(supplyId);
    }

    @PostMapping("/{supplyId}/stock-batches")
    public ResponseEntity<List<UUID>> addStockBatches(@PathVariable UUID supplyId,
                                                      @Valid @RequestBody List<StockBatchRequestDto> batches) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        UUID currentUser = TenantContext.getCurrentUser();

        List<UUID> createdIds = supplyService.addStockBatches(tenantId, supplyId, batches, currentUser);
        return ResponseEntity.ok(createdIds);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplyResponseDto> getSupply(@PathVariable UUID id) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        return ResponseEntity.ok(supplyService.getSupplyById(tenantId, id));
    }

    @GetMapping
    public ResponseEntity<List<SupplyResponseDto>> listSupplies(@RequestParam(required = false) UUID distributorId) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        return ResponseEntity.ok(supplyService.listSupplies(tenantId, distributorId));
    }
}
