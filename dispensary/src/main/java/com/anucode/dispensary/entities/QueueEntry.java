package com.anucode.dispensary.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "queue_entry",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"patient_id", "doctor_id", "queue_date", "status"}
        ))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QueueEntry {

    public enum Status {
        BOOKED, CHECKED_IN_WAITING, IN_PROGRESS, SERVED, NO_SHOW, REMOVED
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Column(name = "queue_number")
    private Integer queueNumber;

    @Column(name = "queue_date", nullable = false)
    private LocalDate queueDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "checked_in_at")
    private LocalDateTime checkedInAt;

    @Column(name = "inprogress_at")
    private LocalDateTime inProgressAt;

    @Column(name = "served_at")
    private LocalDateTime servedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (queueDate == null) queueDate = LocalDate.now();
        if (status == null) status = Status.BOOKED;
    }
}
