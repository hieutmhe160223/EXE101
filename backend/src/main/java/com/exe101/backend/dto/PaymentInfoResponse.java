package com.exe101.backend.dto;

import com.exe101.backend.model.PaymentMethod;
import java.math.BigDecimal;

public record PaymentInfoResponse(
        PaymentMethod method,
        BigDecimal amount,
        String orderCode,
        // Bank transfer
        String bankName,
        String accountNumber,
        String accountName,
        String transferContent,
        String qrImageUrl,
        // MoMo / ZaloPay
        String paymentUrl
) {}