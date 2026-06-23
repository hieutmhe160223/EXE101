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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions")
public class PaymentTransaction extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private PurchaseOrder order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "payer_id", nullable = false)
    private UserAccount payer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amountVnd = BigDecimal.ZERO;

    @Column(length = 150)
    private String providerTransactionCode;

    private LocalDateTime paidAt;

    protected PaymentTransaction() {
    }

    public PaymentTransaction(
            PurchaseOrder order,
            UserAccount payer,
            PaymentType type,
            PaymentMethod method,
            PaymentStatus status,
            BigDecimal amountVnd,
            String providerTransactionCode,
            LocalDateTime paidAt
    ) {
        this.order = order;
        this.payer = payer;
        this.type = type;
        this.method = method;
        this.status = status;
        this.amountVnd = amountVnd;
        this.providerTransactionCode = providerTransactionCode;
        this.paidAt = paidAt;
    }

    public Long getId() {
        return id;
    }

    public PurchaseOrder getOrder() {
        return order;
    }

    public UserAccount getPayer() {
        return payer;
    }

    public PaymentType getType() {
        return type;
    }

    public PaymentMethod getMethod() {
        return method;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public BigDecimal getAmountVnd() {
        return amountVnd;
    }

    public String getProviderTransactionCode() {
        return providerTransactionCode;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }
}
