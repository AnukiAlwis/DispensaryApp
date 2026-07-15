package com.anucode.dispensary.controllers;

import com.anucode.dispensary.config.TenantContext;
import com.anucode.dispensary.dtos.QueueCreateDto;
import com.anucode.dispensary.dtos.QueueResponseDto;
import com.anucode.dispensary.services.QueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/queue")
@RequiredArgsConstructor
public class QueueController {

    private final QueueService queueService;

    @PostMapping
    public ResponseEntity<QueueResponseDto> createQueue(@Valid @RequestBody QueueCreateDto request) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        UUID currentUserId = TenantContext.getCurrentUser();

        QueueResponseDto queue = queueService.createQueueEntry(tenantId, currentUserId, request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(queue.getId())
                .toUri();

        return ResponseEntity.created(location).body(queue);
    }

    @PatchMapping("/{id}/check-in")
    public ResponseEntity<QueueResponseDto> checkIn(@PathVariable UUID id) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        UUID currentUserId = TenantContext.getCurrentUser();

        QueueResponseDto dto = queueService.checkIn(tenantId, currentUserId, id);
        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/{id}/start")
    public ResponseEntity<QueueResponseDto> start(@PathVariable UUID id) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        UUID currentUserId = TenantContext.getCurrentUser();

        QueueResponseDto dto = queueService.startConsultation(tenantId, currentUserId, id);
        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/{id}/serve")
    public ResponseEntity<QueueResponseDto> serve(@PathVariable UUID id) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        UUID currentUserId = TenantContext.getCurrentUser();

        QueueResponseDto dto = queueService.serve(tenantId, currentUserId, id);
        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/{id}/no-show")
    public ResponseEntity<QueueResponseDto> noShow(@PathVariable UUID id) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        UUID currentUserId = TenantContext.getCurrentUser();

        QueueResponseDto dto = queueService.markNoShow(tenantId, currentUserId, id);
        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/{id}/remove")
    public ResponseEntity<QueueResponseDto> remove(@PathVariable UUID id) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        UUID currentUserId = TenantContext.getCurrentUser();

        QueueResponseDto dto = queueService.remove(tenantId, currentUserId, id);
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<List<QueueResponseDto>> getDoctorQueue(@RequestParam String doctorId) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        List<QueueResponseDto> list = queueService.getDoctorQueue(tenantId, UUID.fromString(doctorId));
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<QueueResponseDto> getQueueById(@PathVariable UUID id) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        QueueResponseDto dto = queueService.getQueueById(tenantId, id);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/search")
    public ResponseEntity<List<QueueResponseDto>> searchQueueByPatient(@RequestParam String searchTerm) {
        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        List<QueueResponseDto> list = queueService.searchQueueByPatientNameOrPhone(tenantId, java.time.LocalDate.now(), searchTerm);
        return ResponseEntity.ok(list);
    }
}
