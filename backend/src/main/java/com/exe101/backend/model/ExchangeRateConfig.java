package com.exe101.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "exchange_rate_configs")
public class ExchangeRateConfig extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String currencyPair;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal rate;

    @Column(nullable = false)
    private Boolean active = true;

    protected ExchangeRateConfig() {
    }

    public ExchangeRateConfig(String currencyPair, BigDecimal rate) {
        this.currencyPair = currencyPair;
        this.rate = rate;
    }

    public String getCurrencyPair() {
        return currencyPair;
    }
}
