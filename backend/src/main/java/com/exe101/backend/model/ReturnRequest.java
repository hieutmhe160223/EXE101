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
import java.time.LocalDateTime;

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

    @Column(precision = 15, scale = 2)
    private BigDecimal requestedAmountVnd;

    @Column(precision = 15, scale = 2)
    private BigDecimal approvedAmountVnd;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private UserAccount reviewedBy;

    private LocalDateTime reviewedAt;

    @Column(unique = true, length = 100)
    private String refundReference;

    @Enumerated(EnumType.STRING)
    @Column(length = 40)
    private OrderStatus previousOrderStatus;

    protected ReturnRequest() {
    }

    public ReturnRequest(PurchaseOrder order, UserAccount customer, String reason, String evidenceUrl) {
        this.order = order;
        this.customer = customer;
        this.reason = reason;
        this.evidenceUrl = evidenceUrl;
        this.previousOrderStatus = order.getStatus();
    }
    public ReturnRequest(PurchaseOrder order,UserAccount customer,String reason,String evidenceUrl,BigDecimal requestedAmountVnd) {
        this(order,customer,reason,evidenceUrl);this.requestedAmountVnd=requestedAmountVnd;
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
    public BigDecimal getRequestedAmountVnd(){return requestedAmountVnd;}
    public BigDecimal getApprovedAmountVnd(){return approvedAmountVnd;}
    public LocalDateTime getReviewedAt(){return reviewedAt;}
    public String getRefundReference(){return refundReference;}
    public OrderStatus getPreviousOrderStatus(){return previousOrderStatus;}
    public void completeRefund(BigDecimal amount,String note,UserAccount admin,String reference) {
        if(status==ReturnRequestStatus.COMPLETED)return;
        if(status==ReturnRequestStatus.REJECTED)throw new IllegalStateException("Yêu cầu đã bị từ chối");
        approvedAmountVnd=amount;adminNote=note;reviewedBy=admin;reviewedAt=LocalDateTime.now();refundReference=reference;status=ReturnRequestStatus.COMPLETED;
    }
    public void reject(String note,UserAccount admin) {
        if(status==ReturnRequestStatus.REJECTED)return;
        if(status==ReturnRequestStatus.COMPLETED)throw new IllegalStateException("Yêu cầu đã được hoàn tiền");
        adminNote=note;reviewedBy=admin;reviewedAt=LocalDateTime.now();status=ReturnRequestStatus.REJECTED;
    }
}
