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

    @Override
    public CurrentServingPrescriptionDto getCurrentServing(UUID tenantId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        LocalDateTime startOfTomorrow = startOfDay.plusDays(1);

        return prescriptionRepository
                .findFirstByTenantIdAndStatusAndUpdatedAtBetweenOrderByUpdatedAtAsc(
                        tenantId, Prescription.Status.ISSUED, startOfDay, startOfTomorrow)
                .map(prescription -> {
                    CurrentServingPrescriptionDto dto = new CurrentServingPrescriptionDto();
                    dto.setId(prescription.getId());
                    Patient patient = prescription.getPatient();
                    dto.setPatientName(patient != null ? (patient.getFirstName() + " " + patient.getLastName()) : null);
                    dto.setPatientPhone(patient != null ? patient.getContact() : null);
                    User doctor = prescription.getDoctor();
                    dto.setDoctorName(doctor != null ? doctor.getFullName() : null);
                    dto.setIssuedAt(prescription.getUpdatedAt()); // using updatedAt as proxy for issued time
                    return dto;
                })
                .orElse(null); // Return null if no current serving prescription exists
    }

    @Override
    public List<CurrentServingPrescriptionDto> getUpNext(UUID tenantId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        LocalDateTime startOfTomorrow = startOfDay.plusDays(1);

        // First get current serving to exclude it
        CurrentServingPrescriptionDto currentServing = getCurrentServing(tenantId);
        UUID excludeId = currentServing != null ? currentServing.getId() : null;

        List<Prescription> prescriptions;
        if (excludeId != null) {
            prescriptions = prescriptionRepository
                    .findByTenantIdAndStatusAndUpdatedAtBetweenAndIdNotOrderByUpdatedAtAsc(
                            tenantId, Prescription.Status.ISSUED, startOfDay, startOfTomorrow, excludeId);
        } else {
            // If no current serving, get all ISSUED prescriptions for today using the existing method
            prescriptions = prescriptionRepository
                    .findByTenantIdAndStatus(tenantId, Prescription.Status.ISSUED)
                    .stream()
                    .filter(p -> p.getUpdatedAt() != null && 
                            !p.getUpdatedAt().isBefore(startOfDay) && 
                            p.getUpdatedAt().isBefore(startOfTomorrow))
                    .sorted(java.util.Comparator.comparing(Prescription::getUpdatedAt))
                    .collect(java.util.stream.Collectors.toList());
        }

        return prescriptions.stream()
                .map(prescription -> {
                    CurrentServingPrescriptionDto dto = new CurrentServingPrescriptionDto();
                    dto.setId(prescription.getId());
                    Patient patient = prescription.getPatient();
                    dto.setPatientName(patient != null ? (patient.getFirstName() + " " + patient.getLastName()) : null);
                    dto.setPatientPhone(patient != null ? patient.getContact() : null);
                    User doctor = prescription.getDoctor();
                    dto.setDoctorName(doctor != null ? doctor.getFullName() : null);
                    dto.setIssuedAt(prescription.getUpdatedAt());
                    return dto;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public List<PrescriptionMedicineDto> getPrescriptionMedicines(UUID tenantId, UUID prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new NotFoundException("Prescription not found"));

        if (!prescription.getTenant().getId().equals(tenantId))
            throw new TenantMismatchException("Tenant mismatch");

        List<PrescriptionItem> items = prescriptionItemRepository.findByPrescriptionId(prescriptionId);

        // Sort by frequency weight (descending) then quantity (descending)
        // Frequency weight: extract leading integer from frequency string via regex, default 0 if unparseable
        items.sort((a, b) -> {
            int freqWeightA = extractFrequencyWeight(a.getFrequency());
            int freqWeightB = extractFrequencyWeight(b.getFrequency());
            if (freqWeightB != freqWeightA) {
                return Integer.compare(freqWeightB, freqWeightA); // descending
            }
            // Tie-break by quantity descending
            Integer qtyA = a.getQtyPrescribed() != null ? a.getQtyPrescribed() : 0;
            Integer qtyB = b.getQtyPrescribed() != null ? b.getQtyPrescribed() : 0;
            return Integer.compare(qtyB, qtyA);
        });

        return items.stream()
                .map(item -> {
                    PrescriptionMedicineDto dto = new PrescriptionMedicineDto();
                    dto.setId(item.getId());
                    dto.setMedicineName(item.getMedicine() != null ? item.getMedicine().getName() : null);
                    dto.setStrength(item.getMedicine() != null ? item.getMedicine().getStrength() : null);
                    dto.setDose(item.getDosage());
                    dto.setFrequency(item.getFrequency());
                    dto.setQuantity(item.getQtyPrescribed());
                    dto.setCurrentStock(item.getMedicine() != null ? item.getMedicine().getQuantity() : null);
                    return dto;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    private int extractFrequencyWeight(String frequency) {
        if (frequency == null || frequency.isEmpty()) {
            return 0;
        }
        // Extract leading integer via regex ^(\d+)
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("^(\\d+)");
        java.util.regex.Matcher matcher = pattern.matcher(frequency);
        if (matcher.find()) {
            try {
                return Integer.parseInt(matcher.group(1));
            } catch (NumberFormatException e) {
                return 0;
            }
        }
        return 0;
    }
}

