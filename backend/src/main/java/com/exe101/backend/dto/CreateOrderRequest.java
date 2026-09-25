package com.exe101.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateOrderRequest(
        @NotNull Long customerId,
        @NotNull Long productQuoteId,
        @NotNull @Min(1) @jakarta.validation.constraints.Max(100) Integer quantity,
        @jakarta.validation.constraints.Size(max = 500) String variantSelected,
        @jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max = 500) String shippingAddress,
        @jakarta.validation.constraints.Size(max = 1000) String customerNote,
        @jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max = 80) String requestKey,
        @NotNull @jakarta.validation.constraints.DecimalMin("1") java.math.BigDecimal expectedTotalVnd
) {}