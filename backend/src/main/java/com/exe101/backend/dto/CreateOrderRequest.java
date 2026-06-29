package com.exe101.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateOrderRequest(
        @NotNull Long customerId,
        @NotNull Long productQuoteId,
        @NotNull @Min(1) Integer quantity,
        String variantSelected,
        String shippingAddress,
        String customerNote
) {}