package com.anucode.dispensary.entities;


import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "prescription_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionItem {

    @Id
    @Column(name = "id", columnDefinition = "BINARY(16)")
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @ManyToOne
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Column(name = "dosage")
    private String dosage;

    @Column(name = "frequency")
    private String frequency;

    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(name = "qty_prescribed")
    private Integer qtyPrescribed;

    @Column(name = "instructions")
    private String instructions;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID();
    }

    // getters and setters
}

