package com.anucode.dispensary.repos;

import com.anucode.dispensary.entities.Dispense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DispenseRepository extends JpaRepository<Dispense, UUID> {
    List<Dispense> findByPrescriptionItemPrescriptionId(UUID prescriptionId);
}
