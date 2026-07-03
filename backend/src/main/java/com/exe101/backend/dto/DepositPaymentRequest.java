package com.exe101.backend.dto;

import com.exe101.backend.model.PaymentMethod;
import jakarta.validation.constraints.NotNull;

public record DepositPaymentRequest(
        @NotNull Long customerId,
        @NotNull PaymentMethod paymentMethod,
        String providerTransactionCode
) {}