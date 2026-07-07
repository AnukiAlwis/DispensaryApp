package com.anucode.dispensary.services.serviceImpl;

import com.anucode.dispensary.dtos.PatientRequestDto;
import com.anucode.dispensary.dtos.PatientResponseDto;
import com.anucode.dispensary.entities.Patient;
import com.anucode.dispensary.entities.Tenant;
import com.anucode.dispensary.entities.User;
import com.anucode.dispensary.exception.PatientNotFoundException;
import com.anucode.dispensary.exception.TenantMismatchException;
import com.anucode.dispensary.exception.UserNotFoundException;
import com.anucode.dispensary.repos.PatientRepository;
import com.anucode.dispensary.repos.TenantRepository;
import com.anucode.dispensary.repos.UserRepository;
import com.anucode.dispensary.services.PatientService;
import com.anucode.dispensary.utilities.PatientAgeCalculator;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final TenantRepository tenantRepository;

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    public PatientServiceImpl(PatientRepository patientRepository,
                              TenantRepository tenantRepository,
                              UserRepository userRepository,
                              ModelMapper modelMapper) {
        this.patientRepository = patientRepository;
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public String createPatient(UUID tenantId, PatientRequestDto requestDto, UUID createdById) {
        Patient patient = modelMapper.map(requestDto, Patient.class);
        patient.setId(null);
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new TenantMismatchException("Tenant mismatch"));
        patient.setTenant(tenant);
        patient.setCreatedAt(LocalDateTime.now());

        User createdByUser = userRepository.findById(createdById)
                        .orElseThrow(() -> new UserNotFoundException("Invalid createdBy user"));
        patient.setCreatedBy(createdByUser);

        Patient savedPatient = patientRepository.save(patient);
        return savedPatient.getId().toString();
    }

    @Override
    public PatientResponseDto getPatientById(UUID tenantId, UUID patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException("Patient with ID " + patientId + " not found"));

        if (!patient.getTenant().getId().equals(tenantId)) {
            throw new TenantMismatchException("Tenant mismatch");
        }
        PatientResponseDto dto = modelMapper.map(patient, PatientResponseDto.class);
        dto.setAge(PatientAgeCalculator.calculateAge(patient.getDob()).toString());
        return dto;
    }

    @Override
    public PatientResponseDto updatePatient(UUID tenantId, UUID patientId, PatientRequestDto requestDto) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException("Patient with ID " + patientId + " not found"));

        if (!patient.getTenant().getId().equals(tenantId)) {
            throw new TenantMismatchException("Tenant mismatch");
        }

        if (requestDto.getFirstName() != null) patient.setFirstName(requestDto.getFirstName());
        if (requestDto.getLastName() != null) patient.setLastName(requestDto.getLastName());
        if (requestDto.getDob() != null) patient.setDob(requestDto.getDob());
        if (requestDto.getGender() != null) patient.setGender(requestDto.getGender());
        if (requestDto.getContact() != null) patient.setContact(requestDto.getContact());
        if (requestDto.getAddress() != null) patient.setAddress(requestDto.getAddress());

        patient.setUpdatedAt(LocalDateTime.now());
        patientRepository.save(patient);
        return modelMapper.map(patient, PatientResponseDto.class);
    }

    @Override
    public List<PatientResponseDto> searchPatients(UUID tenantId, String query) {
        List<Patient> patients = patientRepository
                .findByTenantIdAndFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
                        tenantId, query, query
                );
        return patients.stream()
                .map(p -> modelMapper.map(p, PatientResponseDto.class))
                .peek(dto -> {
                    Integer age = PatientAgeCalculator.calculateAge(dto.getDob());
                    dto.setAge(age.toString() + " yrs");
                })
                .collect(Collectors.toList());
    }
}
