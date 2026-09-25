package com.exe101.backend.dto;
import java.math.BigDecimal;
import java.util.List;
public record PricePreviewResponse(
        int quantity, BigDecimal productPriceCny, BigDecimal domesticShippingFeeCny,
        BigDecimal serviceFeeVnd, BigDecimal internationalShippingFeeVnd, BigDecimal insuranceFeeVnd,
        BigDecimal exchangeRate, BigDecimal totalCny, BigDecimal grandTotalVnd,
        BigDecimal depositAmountVnd, BigDecimal finalAmountVnd, BigDecimal depositPercent,
        List<CostBreakdownItemDto> costBreakdown) {}
