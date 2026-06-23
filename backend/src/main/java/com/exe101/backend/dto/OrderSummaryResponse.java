package com.exe101.backend.dto;

import com.exe101.backend.model.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderSummaryResponse(
        Long id,
        String orderCode,
        OrderStatus status,
        Integer quantity,
        BigDecimal totalAmountVnd,
        BigDecimal paidAmountVnd,
        BigDecimal finalAmountVnd,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
