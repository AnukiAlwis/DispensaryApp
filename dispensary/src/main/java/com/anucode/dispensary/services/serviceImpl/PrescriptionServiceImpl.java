package com.anucode.dispensary.services.serviceImpl;

import com.anucode.dispensary.dtos.*;
import com.anucode.dispensary.entities.*;
import com.anucode.dispensary.exception.*;
import com.anucode.dispensary.repos.*;
import com.anucode.dispensary.services.PrescriptionService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PrescriptionServiceImpl implements PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final VisitRepository visitRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PatientRepository patientRepository;
    private final MedicineRepository medicineRepository;
    private final ModelMapper modelMapper;

    public PrescriptionServiceImpl(PrescriptionRepository prescriptionRepository,
                                   PrescriptionItemRepository prescriptionItemRepository,
                                   VisitRepository visitRepository,
                                   UserRepository userRepository,
                                   TenantRepository tenantRepository,
                                   PatientRepository patientRepository,
                                   MedicineRepository medicineRepository,
                                   ModelMapper modelMapper) {
        this.prescriptionRepository = prescriptionRepository;
        this.prescriptionItemRepository = prescriptionItemRepository;
        this.visitRepository = visitRepository;
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.patientRepository = patientRepository;
        this.medicineRepository = medicineRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public UUID createPrescription(UUID tenantId, UUID doctorId, PrescriptionRequestDto requestDto) {

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new TenantMismatchException("Tenant mismatch"));

        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new UserNotFoundException("Doctor not found"));

        Visit visit = visitRepository.findById(requestDto.getVisitId())
                .orElseThrow(() -> new VisitNotFoundException("Visit not found"));

        Patient patient = patientRepository.findById(requestDto.getPatientId())
                .orElseThrow(() -> new UserNotFoundException("Patient not found"));

        if (!visit.getTenant().getId().equals(tenantId) || !patient.getTenant().getId().equals(tenantId)) {
            throw new TenantMismatchException("Tenant mismatch");
        }

        if (visit.getStatus() == Visit.Status.CLOSED || visit.getStatus() == Visit.Status.CANCELLED) {
            throw new InvalidRequestException(
                    "Unable to create prescription with visit status " + visit.getStatus());
        }

        Prescription prescription = new Prescription();
        prescription.setTenant(tenant);
        prescription.setDoctor(doctor);
        prescription.setPatient(patient);
        prescription.setVisit(visit);
        prescription.setStatus(Prescription.Status.STARTED);
        prescription.setCreatedAt(LocalDateTime.now());

        prescriptionRepository.save(prescription);
        return prescription.getId();
    }

    @Override
    public PrescriptionResponseDto getPrescription(UUID tenantId, UUID prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new NotFoundException("Prescription not found"));

        if (!prescription.getTenant().getId().equals(tenantId))
            throw new TenantMismatchException("Tenant mismatch");

        return modelMapper.map(prescription, PrescriptionResponseDto.class);
    }

    @Override
    public UUID addPrescriptionItem(UUID tenantId, UUID prescriptionId, PrescriptionItemRequestDto requestDto, UUID recordedById) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new NotFoundException("Prescription not found"));

        if (!prescription.getTenant().getId().equals(tenantId))
            throw new TenantMismatchException("Tenant mismatch");

        if (prescription.getStatus() != Prescription.Status.STARTED)
            throw new InvalidStatusTransitionException("Can add items only to STARTED prescriptions");

        Medicine medicine = medicineRepository.findById(requestDto.getMedicineId())
                .orElseThrow(() -> new NotFoundException("Medicine not found"));

        PrescriptionItem item = modelMapper.map(requestDto, PrescriptionItem.class);
        item.setId(null);
        item.setPrescription(prescription);

        prescriptionItemRepository.save(item);
        return item.getId();
    }

    @Override
    public List<PrescriptionItemResponseDto> getPrescriptionItems(UUID tenantId, UUID prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new NotFoundException("Prescription not found"));

        if (!prescription.getTenant().getId().equals(tenantId))
            throw new TenantMismatchException("Tenant mismatch");

        return prescriptionItemRepository.findByPrescriptionId(prescriptionId).stream()
                .map(item -> {
                    PrescriptionItemResponseDto dto = modelMapper.map(item, PrescriptionItemResponseDto.class);
                    if (item.getMedicine() != null) {
                        dto.setMedicineName(item.getMedicine().getName());
                        dto.setMedicineStrength(item.getMedicine().getStrength());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public PrescriptionResponseDto updatePrescriptionStatus(UUID tenantId, UUID prescriptionId, String newStatusStr) {

        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new NotFoundException("Prescription not found"));

        if (!prescription.getTenant().getId().equals(tenantId))
            throw new TenantMismatchException("Tenant mismatch");

        Prescription.Status newStatus = Prescription.Status.valueOf(newStatusStr);

        // Validate transitions
        if (prescription.getStatus() == Prescription.Status.STARTED && newStatus != Prescription.Status.ISSUED) {
            throw new InvalidStatusTransitionException("STARTED can only transition to ISSUED");
        }

        if (prescription.getStatus() == Prescription.Status.ISSUED &&
                !(newStatus == Prescription.Status.DISPENSED || newStatus == Prescription.Status.CANCELLED)) {
            throw new InvalidStatusTransitionException("ISSUED can only transition to DISPENSED or CANCELLED");
        }

        if (prescription.getStatus() == Prescription.Status.DISPENSED || prescription.getStatus() == Prescription.Status.CANCELLED) {
            throw new InvalidStatusTransitionException("Cannot change status of DISPENSED or CANCELLED prescription");
        }

        prescription.setStatus(newStatus);
        prescriptionRepository.save(prescription);
        return modelMapper.map(prescription, PrescriptionResponseDto.class);
    }

    @Override
    public PrescriptionResponseDto getPrescriptionByVisitId(UUID tenantId, UUID visitId) {
        Prescription prescription = prescriptionRepository.findByVisitId(visitId)
                .orElseThrow(() -> new NotFoundException("Prescription not found"));

        if (!prescription.getTenant().getId().equals(tenantId))
            throw new TenantMismatchException("Tenant mismatch");

        return modelMapper.map(prescription, PrescriptionResponseDto.class);
    }
}

