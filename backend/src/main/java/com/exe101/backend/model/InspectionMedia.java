package com.exe101.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "inspection_media")
public class InspectionMedia extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private PurchaseOrder order;

    @Column(nullable = false, length = 20)
    private String mediaType;

    @Column(nullable = false, length = 1000)
    private String mediaUrl;

    @Column(length = 500)
    private String note;

    protected InspectionMedia() {
    }

    public InspectionMedia(PurchaseOrder order, String mediaType, String mediaUrl, String note) {
        this.order = order;
        this.mediaType = mediaType;
        this.mediaUrl = mediaUrl;
        this.note = note;
    }

    public Long getId() {
        return id;
    }

    public PurchaseOrder getOrder() {
        return order;
    }

    public String getMediaType() {
        return mediaType;
    }

    public String getMediaUrl() {
        return mediaUrl;
    }

    public String getNote() {
        return note;
    }
}
