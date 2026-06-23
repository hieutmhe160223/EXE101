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

import java.math.BigDecimal;

@Entity
@Table(name = "sourcing_requests")
public class SourcingRequest extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private UserAccount customer;

    @Lob
    @Column(nullable = false)
    private String requirementDescription;

    @Column(length = 1000)
    private String referenceImageUrl;

    @Column(precision = 15, scale = 2)
    private BigDecimal expectedBudgetVnd;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SourcingStatus status = SourcingStatus.NEW;

    protected SourcingRequest() {
    }
}
