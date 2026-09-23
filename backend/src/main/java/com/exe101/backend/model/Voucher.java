package com.exe101.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vouchers")
public class Voucher extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal discountValue = BigDecimal.ZERO;

    @Column(nullable = false)
    private Boolean percentage = false;

    @Column(precision = 15, scale = 2)
    private BigDecimal maxDiscountVnd;

    @Column(precision = 15, scale = 2)
    private BigDecimal minimumOrderVnd;

    private LocalDateTime startsAt;

    private LocalDateTime endsAt;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false)
    private Integer usageLimit = 0;

    protected Voucher() {
    }

    public Voucher(String code, String name, BigDecimal discountValue, Boolean percentage,
                   BigDecimal maxDiscountVnd, BigDecimal minimumOrderVnd,
                   LocalDateTime startsAt, LocalDateTime endsAt, Integer usageLimit) {
        this.code = code;
        this.name = name;
        this.discountValue = discountValue;
        this.percentage = percentage;
        this.maxDiscountVnd = maxDiscountVnd;
        this.minimumOrderVnd = minimumOrderVnd;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
        this.usageLimit = usageLimit;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public BigDecimal getDiscountValue() { return discountValue; }
    public Boolean getPercentage() { return percentage; }
    public BigDecimal getMaxDiscountVnd() { return maxDiscountVnd; }
    public BigDecimal getMinimumOrderVnd() { return minimumOrderVnd; }
    public LocalDateTime getStartsAt() { return startsAt; }
    public LocalDateTime getEndsAt() { return endsAt; }
    public Boolean getActive() { return active; }
    public Integer getUsageLimit() { return usageLimit; }

    public void update(String code, String name, BigDecimal discountValue, Boolean percentage,
                       BigDecimal maxDiscountVnd, BigDecimal minimumOrderVnd,
                       LocalDateTime startsAt, LocalDateTime endsAt, Integer usageLimit) {
        this.code = code;
        this.name = name;
        this.discountValue = discountValue;
        this.percentage = percentage;
        this.maxDiscountVnd = maxDiscountVnd;
        this.minimumOrderVnd = minimumOrderVnd;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
        this.usageLimit = usageLimit;
    }

    public void setActive(Boolean active) { this.active = active; }
}
