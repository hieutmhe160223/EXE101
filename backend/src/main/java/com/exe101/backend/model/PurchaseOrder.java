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

@Entity
@Table(name = "purchase_orders", uniqueConstraints = @jakarta.persistence.UniqueConstraint(columnNames = {"customer_id", "request_key"}))
public class PurchaseOrder extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String orderCode;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private UserAccount customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_quote_id")
    private ProductQuote productQuote;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private OrderStatus status = OrderStatus.WAITING_DEPOSIT;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmountVnd = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal depositAmountVnd = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal finalAmountVnd = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal paidAmountVnd = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal refundedAmountVnd = BigDecimal.ZERO;

    @Column(length = 500)
    private String shippingAddress;

    @Column(length = 1000)
    private String customerNote;

    @Column(name = "request_key", length = 80) private String requestKey;
    public String getRequestKey() { return requestKey; }
    public void setRequestKey(String value) { requestKey = value; }
    @Column(length = 300) private String productName;
    @Column(length = 2000) private String productImageUrl;
    @Column(length = 2000) private String sourceUrl;
    @Column(length = 500) private String variantSelected;
    @jakarta.persistence.Lob private String costSnapshotJson;

    public void setProductSnapshot(ProductQuote quote, String variant) {
        productQuote = quote; productName = quote.getTranslatedName(); productImageUrl = quote.getImageUrl();
        sourceUrl = quote.getSourceUrl(); variantSelected = variant;
    }
    public void setCostSnapshot(com.exe101.backend.dto.PricePreviewResponse price) {
        try { costSnapshotJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(price); }
        catch (com.fasterxml.jackson.core.JsonProcessingException e) { throw new IllegalStateException("Không lưu được bảng giá", e); }
    }
    public String getProductName() { return productName; }
    public String getProductImageUrl() { return productImageUrl; }
    public String getSourceUrl() { return sourceUrl; }
    public String getVariantSelected() { return variantSelected; }
    public String getCostSnapshotJson() { return costSnapshotJson; }

    protected PurchaseOrder() {
    }

    public PurchaseOrder(
            String orderCode,
            UserAccount customer,
            Integer quantity,
            BigDecimal totalAmountVnd,
            BigDecimal depositAmountVnd,
            BigDecimal finalAmountVnd,
            String shippingAddress,
            String customerNote
    ) {
        this.orderCode = orderCode;
        this.customer = customer;
        this.quantity = quantity;
        this.totalAmountVnd = totalAmountVnd;
        this.depositAmountVnd = depositAmountVnd;
        this.finalAmountVnd = finalAmountVnd;
        this.shippingAddress = shippingAddress;
        this.customerNote = customerNote;
    }

    public Long getId() {
        return id;
    }

    public String getOrderCode() {
        return orderCode;
    }

    public UserAccount getCustomer() {
        return customer;
    }

    public ProductQuote getProductQuote() {
        return productQuote;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public BigDecimal getTotalAmountVnd() {
        return totalAmountVnd;
    }

    public BigDecimal getDepositAmountVnd() {
        return depositAmountVnd;
    }

    public BigDecimal getFinalAmountVnd() {
        return finalAmountVnd;
    }

    public BigDecimal getPaidAmountVnd() {
        return paidAmountVnd;
    }

    public BigDecimal getRefundedAmountVnd() {
        return refundedAmountVnd == null ? BigDecimal.ZERO : refundedAmountVnd;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public String getCustomerNote() {
        return customerNote;
    }

    public void changeStatus(OrderStatus status) {
        this.status = status;
    }

    public void addPaidAmount(BigDecimal amountVnd) {
        this.paidAmountVnd = this.paidAmountVnd.add(amountVnd);
    }

    public void addRefundedAmount(BigDecimal amountVnd) {
        if(amountVnd==null||amountVnd.signum()<=0)throw new IllegalArgumentException("Số tiền hoàn không hợp lệ");
        BigDecimal next=getRefundedAmountVnd().add(amountVnd);
        if(next.compareTo(paidAmountVnd)>0)throw new IllegalStateException("Tổng tiền hoàn vượt số tiền đã thanh toán");
        refundedAmountVnd=next;
    }
}
