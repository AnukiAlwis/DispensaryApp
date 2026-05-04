package com.anucode.dispensary.repos;

import com.anucode.dispensary.entities.Medicine;
import com.anucode.dispensary.entities.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, UUID> {

    List<Medicine> findByTenantId(UUID tenantId);
}



