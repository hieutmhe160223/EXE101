package com.exe101.backend.dto;

import com.exe101.backend.model.PaymentMethod;
import java.math.BigDecimal;

public record PaymentInfoResponse(
        PaymentMethod method,
        BigDecimal amountVnd,
        String orderCode,
        String bankName,
        String accountNumber,
        String accountName,
        String transferContent,
        String qrImageUrl,
        String paymentUrl
) {
    public BigDecimal amount() {
        return amountVnd;
    }

    public String qrUrl() {
        return qrImageUrl;
    }
}
