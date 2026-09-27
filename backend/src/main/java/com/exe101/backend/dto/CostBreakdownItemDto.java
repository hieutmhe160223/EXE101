package com.exe101.backend.dto;

import java.math.BigDecimal;

public class CostBreakdownItemDto {
    private String label;
    private BigDecimal value;
    private String currency; // "¥" hoặc "₫"

    @com.fasterxml.jackson.annotation.JsonCreator
    public CostBreakdownItemDto(@com.fasterxml.jackson.annotation.JsonProperty("label") String label,
            @com.fasterxml.jackson.annotation.JsonProperty("value") BigDecimal value,
            @com.fasterxml.jackson.annotation.JsonProperty("currency") String currency) {
        this.label = label;
        this.value = value;
        this.currency = currency;
    }
    public String getLabel() { return label; }
    public BigDecimal getValue() { return value; }
    public String getCurrency() { return currency; }
}