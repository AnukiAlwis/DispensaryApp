package com.anucode.dispensary.repos;

import com.anucode.dispensary.entities.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BillRepository extends JpaRepository<Bill, UUID> {

    List<Bill> findByTenantId(UUID tenantId);
    List<Bill> findByTenantIdAndPatientId(UUID tenantId, UUID patientId);
    Optional<Bill> findByPrescription_Id(UUID prescriptionId);

    @Query("SELECT COALESCE(SUM(b.grandTotal), 0) FROM Bill b WHERE b.tenant.id = :tenantId AND b.prescription.doctor.id = :doctorId AND b.status = 'PAID' AND CAST(b.createdAt AS date) = :date")
    BigDecimal sumIncomeByDoctorAndDate(@Param("tenantId") UUID tenantId, @Param("doctorId") UUID doctorId, @Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM((b.doctorFee * COALESCE(b.doctorDiscountPct, 0) / 100) + (b.medicineTotal * COALESCE(b.pharmacyDiscountPct, 0) / 100)), 0) FROM Bill b WHERE b.tenant.id = :tenantId AND b.prescription.doctor.id = :doctorId AND b.status != 'VOID' AND CAST(b.createdAt AS date) = :date")
    BigDecimal sumCharityByDoctorAndDate(@Param("tenantId") UUID tenantId, @Param("doctorId") UUID doctorId, @Param("date") LocalDate date);
}
