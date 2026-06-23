package com.exe101.backend.dto;

import com.exe101.backend.model.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record FinalPaymentRequest(
        @NotNull Long customerId,
        @NotNull PaymentMethod paymentMethod,
        @Size(max = 150) String providerTransactionCode
) {
}
