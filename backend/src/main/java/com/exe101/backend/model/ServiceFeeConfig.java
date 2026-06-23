package com.exe101.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "service_fee_configs")
public class ServiceFeeConfig extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String feeCode;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "fee_value", nullable = false, precision = 15, scale = 2)
    private BigDecimal value = BigDecimal.ZERO;

    @Column(nullable = false)
    private Boolean percentage = false;

    @Column(nullable = false)
    private Boolean active = true;

    protected ServiceFeeConfig() {
    }

    public ServiceFeeConfig(String feeCode, String name, BigDecimal value, Boolean percentage) {
        this.feeCode = feeCode;
        this.name = name;
        this.value = value;
        this.percentage = percentage;
    }

    public String getFeeCode() {
        return feeCode;
    }
}
