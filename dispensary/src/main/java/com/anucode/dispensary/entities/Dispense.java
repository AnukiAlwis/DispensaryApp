package com.anucode.dispensary.entities;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "dispense")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dispense {

    @Id
    @Column(name = "id", columnDefinition = "BINARY(16)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne
    @JoinColumn(name = "prescription_item_id", nullable = false)
    private PrescriptionItem prescriptionItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Column(name = "qty_dispensed", nullable = false)
    private Integer qtyDispensed;

    @Column(name = "dispensed_at")
    private LocalDateTime dispensedAt;

    @ManyToOne
    @JoinColumn(name = "dispensed_by")
    private User dispensedBy;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (dispensedAt == null) dispensedAt = LocalDateTime.now();
    }

    // getters and setters
}
