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
    private LocalDateTime lastCheckedAt;
    private LocalDateTime cancelledAt;
    @Column(length = 500) private String cancelReason;
    @Column(length = 30) private String cancelledBy;
    public LocalDateTime getLastCheckedAt() { return lastCheckedAt; }
    public void markChecked() { lastCheckedAt=LocalDateTime.now(); }

    @Column(unique = true, length = 80) private String merchantReference;
    @Column(unique = true, length = 200) private String settlementKey;
    @jakarta.persistence.Lob private String instructionsJson;
    @Column(length = 1000) private String reconciliationNote;
    public String getMerchantReference() { return merchantReference; }
    public void setMerchantReference(String value) { merchantReference = value; }
    public String getInstructionsJson() { return instructionsJson; }
    public void setInstructionsJson(String value) { instructionsJson = value; }
    public String getReconciliationNote() { return reconciliationNote; }
    public void setReconciliationNote(String value) { reconciliationNote = value; }
    public void confirmPaid(String code) {
        status = PaymentStatus.PAID; providerTransactionCode = code; settlementKey = method.name() + ":" + code; paidAt = LocalDateTime.now();
    }
    public void fail() { if (status != PaymentStatus.PAID) status = PaymentStatus.FAILED; }
    public void cancel(String reason,String actor) {
        if(status==PaymentStatus.CANCELLED)return;
        if(status!=PaymentStatus.PENDING)throw new IllegalStateException("Giao dịch không còn ở trạng thái chờ để hủy");
        status=PaymentStatus.CANCELLED;cancelledAt=LocalDateTime.now();cancelReason=reason;cancelledBy=actor;
    }
    public void review(String code,String note) {
        if(status==PaymentStatus.REVIEW) {
            if(!java.util.Objects.equals(providerTransactionCode,code))throw new IllegalStateException("Giao dịch đang đối soát với mã khác");
            return;
        }
        if(status!=PaymentStatus.CANCELLED)throw new IllegalStateException("Chỉ chuyển đối soát giao dịch đã hủy");
        status=PaymentStatus.REVIEW;providerTransactionCode=code;settlementKey=method.name()+":"+code;reconciliationNote=note;
    }

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
    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public String getCancelReason() { return cancelReason; }
    public String getCancelledBy() { return cancelledBy; }
}
