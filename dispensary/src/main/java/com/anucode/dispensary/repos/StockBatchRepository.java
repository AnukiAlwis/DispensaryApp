package com.anucode.dispensary.repos;

import com.anucode.dispensary.entities.StockBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StockBatchRepository extends JpaRepository<StockBatch, UUID> {

    List<StockBatch> findBySupplyIdOrderByCreatedAtAsc(UUID supplyId);
}
