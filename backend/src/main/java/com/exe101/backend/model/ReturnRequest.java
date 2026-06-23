package com.exe101.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "return_requests")
public class ReturnRequest extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private PurchaseOrder order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private UserAccount customer;

    @Lob
    @Column(nullable = false)
    private String reason;

    @Column(length = 1000)
    private String evidenceUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReturnRequestStatus status = ReturnRequestStatus.REQUESTED;

    @Column(length = 1000)
    private String adminNote;

    protected ReturnRequest() {
    }

    public ReturnRequest(PurchaseOrder order, UserAccount customer, String reason, String evidenceUrl) {
        this.order = order;
        this.customer = customer;
        this.reason = reason;
        this.evidenceUrl = evidenceUrl;
    }

    public Long getId() {
        return id;
    }

    public PurchaseOrder getOrder() {
        return order;
    }

    public UserAccount getCustomer() {
        return customer;
    }

    public String getReason() {
        return reason;
    }

    public String getEvidenceUrl() {
        return evidenceUrl;
    }

    public ReturnRequestStatus getStatus() {
        return status;
    }

    public String getAdminNote() {
        return adminNote;
    }
}
