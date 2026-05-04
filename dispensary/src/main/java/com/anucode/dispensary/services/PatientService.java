package com.anucode.dispensary.services;

import com.anucode.dispensary.dtos.PatientRequestDto;
import com.anucode.dispensary.dtos.PatientResponseDto;

import java.util.List;
import java.util.UUID;

public interface PatientService {

    String createPatient(UUID tenantId, PatientRequestDto requestDto, UUID createdById);

    PatientResponseDto getPatientById(UUID tenantId, UUID patientId);

    PatientResponseDto updatePatient(UUID tenantId, UUID patientId, PatientRequestDto requestDto);

    List<PatientResponseDto> searchPatients(UUID tenantId, String query);
}
