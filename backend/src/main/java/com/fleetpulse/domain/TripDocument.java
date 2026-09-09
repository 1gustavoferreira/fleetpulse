package com.fleetpulse.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "trip_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "trip_id", nullable = false)
    private Long tripId;

    @Column(name = "doc_type", nullable = false, length = 40)
    private String docType; // CTE, NFE, PORT_BOOKING, WEIGH_TICKET

    @Column(name = "original_filename", nullable = false)
    private String originalFilename;

    @Column(name = "stored_filename", nullable = false)
    private String storedFilename;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "file_size_bytes", nullable = false)
    private Long fileSizeBytes;

    @Column(name = "uploaded_by_user_id")
    private Long uploadedByUserId;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private OffsetDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        this.uploadedAt = OffsetDateTime.now();
    }
}