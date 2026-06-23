package com.exe101.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "marketing_channel_reports")
public class MarketingChannelReport extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String channelName;

    @Column(nullable = false)
    private LocalDate reportDate;

    @Column(nullable = false)
    private Integer ordersCount = 0;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal revenueVnd = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal marketingCostVnd = BigDecimal.ZERO;

    protected MarketingChannelReport() {
    }
}
