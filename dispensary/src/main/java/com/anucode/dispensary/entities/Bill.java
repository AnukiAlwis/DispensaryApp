package com.anucode.dispensary.entities;


import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "bill")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bill {

    public enum Status {
        DUE, PAID, VOID
    }

    @Id
    @Column(name = "id", columnDefinition = "BINARY(16)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", unique = true, nullable = false)
    private Prescription prescription;

    @Column(name = "doctor_fee")
    private BigDecimal doctorFee;

    @Column(name = "doctor_discount_pct")
    private Integer doctorDiscountPct;

    @Column(name = "doctor_fee_final")
    private BigDecimal doctorFeeFinal;

    @Column(name = "medicine_total")
    private BigDecimal medicineTotal;

    @Column(name = "pharmacy_discount_pct")
    private Integer pharmacyDiscountPct;

    @Column(name = "medicine_total_final")
    private BigDecimal medicineTotalFinal;

    @Column(name = "grand_total")
    private BigDecimal grandTotal;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "bill")
    private List<BillLineItem> lineItems;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null) status = Status.DUE;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // getters and setters
}
