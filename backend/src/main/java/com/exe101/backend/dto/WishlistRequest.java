package com.exe101.backend.dto;

import jakarta.validation.constraints.NotNull;

public record WishlistRequest(
        @NotNull(message = "User ID không được để trống") Long userId,
        @NotNull(message = "Product Quote ID không được để trống") Long productQuoteId
) {}
