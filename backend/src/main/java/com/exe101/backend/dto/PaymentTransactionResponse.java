package com.exe101.backend.dto;

import com.exe101.backend.model.PaymentMethod;
import com.exe101.backend.model.PaymentStatus;
import com.exe101.backend.model.PaymentType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentTransactionResponse(
        Long id,
        Long orderId,
        PaymentType type,
        PaymentMethod method,
        PaymentStatus status,
        BigDecimal amountVnd,
        String providerTransactionCode,
        LocalDateTime paidAt
) {
}
