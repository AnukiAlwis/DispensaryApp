package com.anucode.dispensary.repos;

import com.anucode.dispensary.entities.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {

    List<Patient> findByTenantIdAndFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            UUID tenantId, String firstName, String lastName
    );
}
