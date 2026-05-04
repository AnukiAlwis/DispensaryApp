package com.anucode.dispensary.controllers;

import com.anucode.dispensary.config.TenantContext;
import com.anucode.dispensary.dtos.VisitNoteRequestDto;
import com.anucode.dispensary.dtos.VisitNoteResponseDto;
import com.anucode.dispensary.services.VisitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/visits/{visitId}/notes")
@RequiredArgsConstructor
public class VisitNoteController {

    private final VisitService visitService;

    @PostMapping
    public ResponseEntity<UUID> addVisitNote(@PathVariable UUID visitId,
                                             @Valid @RequestBody VisitNoteRequestDto request) {

        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        UUID currentUserId = TenantContext.getCurrentUser();

        UUID noteId = visitService.addVisitNote(tenantId, visitId, request.getNote(), currentUserId);
        return ResponseEntity.ok(noteId);
    }

    @GetMapping
    public ResponseEntity<List<VisitNoteResponseDto>> getVisitNotes(@PathVariable UUID visitId) {

        UUID tenantId = UUID.fromString(TenantContext.getTenantId());
        List<VisitNoteResponseDto> notes = visitService.getVisitNotes(tenantId, visitId);
        return ResponseEntity.ok(notes);
    }
}
