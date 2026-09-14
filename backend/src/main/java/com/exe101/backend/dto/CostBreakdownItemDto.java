package com.exe101.backend.dto;

import java.math.BigDecimal;

public class CostBreakdownItemDto {
    private String label;
    private BigDecimal value;
    private String currency; // "¥" hoặc "₫"

    public CostBreakdownItemDto(String label, BigDecimal value, String currency) {
        this.label = label;
        this.value = value;
        this.currency = currency;
    }
    public String getLabel() { return label; }
    public BigDecimal getValue() { return value; }
    public String getCurrency() { return currency; }
}