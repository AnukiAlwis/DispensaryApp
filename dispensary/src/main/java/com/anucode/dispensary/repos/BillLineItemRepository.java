package com.anucode.dispensary.repos;

import com.anucode.dispensary.entities.BillLineItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BillLineItemRepository extends JpaRepository<BillLineItem, UUID> {
    List<BillLineItem> findByBillId(UUID billId);
}
