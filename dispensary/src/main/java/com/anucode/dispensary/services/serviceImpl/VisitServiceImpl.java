package com.anucode.dispensary.services.serviceImpl;

import com.anucode.dispensary.dtos.VisitNoteResponseDto;
import com.anucode.dispensary.dtos.VisitRequestDto;
import com.anucode.dispensary.dtos.VisitResponseDto;
import com.anucode.dispensary.entities.*;
import com.anucode.dispensary.exception.PatientNotFoundException;
import com.anucode.dispensary.exception.TenantMismatchException;
import com.anucode.dispensary.exception.UserNotFoundException;
import com.anucode.dispensary.exception.VisitNotFoundException;
import com.anucode.dispensary.repos.*;
import com.anucode.dispensary.services.VisitService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class VisitServiceImpl implements VisitService {

    private final VisitRepository visitRepository;
    private final TenantRepository tenantRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final VisitNoteRepository visitNoteRepository;
    private final ModelMapper modelMapper;

    public VisitServiceImpl(VisitRepository visitRepository,
                            TenantRepository tenantRepository,
                            PatientRepository patientRepository,
                            UserRepository userRepository,
                            VisitNoteRepository visitNoteRepository,
                            ModelMapper modelMapper) {
        this.visitRepository = visitRepository;
        this.tenantRepository = tenantRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.visitNoteRepository = visitNoteRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public String createVisit(UUID tenantId, UUID currentUserId, VisitRequestDto requestDto) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new TenantMismatchException("Tenant mismatch"));

        Patient patient = patientRepository.findById(requestDto.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException("Patient not found"));

        if (!patient.getTenant().getId().equals(tenantId)) {
            throw new TenantMismatchException("Tenant mismatch for patient");
        }

        User doctor = userRepository.findById(requestDto.getDoctorId())
                .orElseThrow(() -> new UserNotFoundException("Doctor not found"));

        Visit visit = new Visit();
        visit.setTenant(tenant);
        visit.setPatient(patient);
        visit.setDoctor(doctor);
        visit.setCreatedBy(userRepository.findById(currentUserId)
                .orElseThrow(() -> new UserNotFoundException("Current user not found")));
        visit.setVisitTime(requestDto.getVisitTime() != null ? requestDto.getVisitTime() : LocalDateTime.now());
        visit.setStatus(requestDto.getStatus() != null ? Visit.Status.valueOf(requestDto.getStatus()) : Visit.Status.OPEN);
        visit.setDoctorFee(doctor.getDoctorCharge());

        visitRepository.save(visit);
        return visit.getId().toString();
    }

    @Override
    public VisitResponseDto getVisitById(UUID tenantId, UUID visitId) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new VisitNotFoundException("Visit not found"));

        if (!visit.getTenant().getId().equals(tenantId)) {
            throw new TenantMismatchException("Tenant mismatch");
        }

        return modelMapper.map(visit, VisitResponseDto.class);
    }

    @Override
    public VisitResponseDto updateVisitStatus(UUID tenantId, UUID currentUserId, UUID visitId, String status) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new VisitNotFoundException("Visit not found"));

        if (!visit.getTenant().getId().equals(tenantId)) {
            throw new TenantMismatchException("Tenant mismatch");
        }

        // Status transitions: OPEN -> CLOSED / CANCELLED; CLOSED cannot be reopened
        if (visit.getStatus() == Visit.Status.CLOSED) {
            throw new IllegalStateException("Closed visit cannot be reopened");
        }

        visit.setStatus(Visit.Status.valueOf(status));
        visit.setUpdatedAt(LocalDateTime.now());
        visitRepository.save(visit);

        return modelMapper.map(visit, VisitResponseDto.class);
    }

    @Override
    public List<VisitResponseDto> listVisits(UUID tenantId, UUID patientId) {
        List<Visit> visits;

        if (patientId != null) {
            visits = visitRepository.findByTenantIdAndPatientId(tenantId, patientId);
        } else {
            visits = visitRepository.findByTenantId(tenantId);
        }

        modelMapper.getConfiguration().setAmbiguityIgnored(true);
        return visits.stream()
                .map(v -> {
                    VisitResponseDto dto = modelMapper.map(v, VisitResponseDto.class);

                    if (v.getPatient() != null) {
                        dto.setPatientName(v.getPatient().getFirstName() + " " + v.getPatient().getLastName());
                    }

                    if (v.getDoctor() != null) {
                        dto.setDoctorName(v.getDoctor().getFullName());
                    }

                    return dto;
                })
                .collect(Collectors.toList());
    }


    @Override
    public UUID addVisitNote(UUID tenantId, UUID visitId, String note, UUID recordedById) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new VisitNotFoundException("Visit with ID " + visitId + " not found"));

        if (!visit.getTenant().getId().equals(tenantId)) {
            throw new TenantMismatchException("Tenant mismatch");
        }

        User recordedBy = userRepository.findById(recordedById)
                .orElseThrow(() -> new UserNotFoundException("Invalid recordedBy user"));

        VisitNote visitNote = VisitNote.builder()
                .visit(visit)
                .note(note)
                .recordedBy(recordedBy)
                .build();

        visitNoteRepository.save(visitNote);
        return visitNote.getId();
    }

    @Override
    public List<VisitNoteResponseDto> getVisitNotes(UUID tenantId, UUID visitId) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new VisitNotFoundException("Visit with ID " + visitId + " not found"));

        if (!visit.getTenant().getId().equals(tenantId)) {
            throw new TenantMismatchException("Tenant mismatch");
        }

        List<VisitNote> notes = visitNoteRepository.findByVisitIdOrderByRecordedAtAsc(visitId);
        return notes.stream()
                .map(note -> {
                    VisitNoteResponseDto dto = modelMapper.map(note, VisitNoteResponseDto.class);
                    if (note.getRecordedBy() != null) {
                        dto.setRecordedById(note.getRecordedBy().getId());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
