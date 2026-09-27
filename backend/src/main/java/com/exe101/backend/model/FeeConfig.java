package com.exe101.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "fee_config")
public class FeeConfig {

    @Id
    private Long id = 1L; // luôn chỉ có 1 dòng duy nhất

    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal domesticShippingCny = new BigDecimal("10.00");

    @Column(precision = 5, scale = 4, nullable = false)
    private BigDecimal serviceFeePercent = new BigDecimal("0.05");

    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal internationalShippingVnd = new BigDecimal("25000");

    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal insuranceVnd = new BigDecimal("10000");

    @Column(precision = 5, scale = 4, nullable = false)
    private BigDecimal depositPercent = new BigDecimal("0.70");

    @Column(nullable = false)
    private Long quoteCacheTtlHours = 6L;

    // getters + setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public BigDecimal getDomesticShippingCny() { return domesticShippingCny; }
    public void setDomesticShippingCny(BigDecimal v) { this.domesticShippingCny = v; }
    public BigDecimal getServiceFeePercent() { return serviceFeePercent; }
    public void setServiceFeePercent(BigDecimal v) { this.serviceFeePercent = v; }
    public BigDecimal getInternationalShippingVnd() { return internationalShippingVnd; }
    public void setInternationalShippingVnd(BigDecimal v) { this.internationalShippingVnd = v; }
    public BigDecimal getInsuranceVnd() { return insuranceVnd; }
    public void setInsuranceVnd(BigDecimal v) { this.insuranceVnd = v; }
    public BigDecimal getDepositPercent() { return depositPercent; }
    public void setDepositPercent(BigDecimal v) { this.depositPercent = v; }
    public Long getQuoteCacheTtlHours() { return quoteCacheTtlHours; }
    public void setQuoteCacheTtlHours(Long v) { this.quoteCacheTtlHours = v; }
}