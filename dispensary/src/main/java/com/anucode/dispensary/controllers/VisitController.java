package com.anucode.dispensary.controllers;

import com.anucode.dispensary.config.TenantContext;
import com.anucode.dispensary.dtos.VisitRequestDto;
import com.anucode.dispensary.dtos.VisitResponseDto;
import com.anucode.dispensary.security.Permissions;
import com.anucode.dispensary.services.VisitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/visits")
@RequiredArgsConstructor
public class VisitController {

    private final VisitService visitService;

    @PostMapping
    @PreAuthorize("hasAuthority('" + Permissions.VISIT_EDIT + "')")
    public ResponseEntity<String> createVisit(@Valid @RequestBody VisitRequestDto request) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        UUID currentUserId = TenantContext.getCurrentUser();

        String visitId = visitService.createVisit(tenantId, currentUserId, request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(visitId)
                .toUri();

        return ResponseEntity.created(location).body(visitId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('" + Permissions.VISIT_VIEW + "')")
    public ResponseEntity<VisitResponseDto> getVisit(@PathVariable UUID id) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        return ResponseEntity.ok(visitService.getVisitById(tenantId, id));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('" + Permissions.VISIT_EDIT + "')")
    public ResponseEntity<VisitResponseDto> updateVisitStatus(@PathVariable UUID id,
                                                              @RequestParam String status) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        UUID currentUserId = TenantContext.getCurrentUser();
        return ResponseEntity.ok(visitService.updateVisitStatus(tenantId, currentUserId, id, status));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('" + Permissions.VISIT_VIEW + "')")
    public ResponseEntity<List<VisitResponseDto>> listVisits(@RequestParam(required = false) UUID patientId) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        return ResponseEntity.ok(visitService.listVisits(tenantId, patientId));
    }
}
