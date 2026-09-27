package com.exe101.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record WishlistItemResponse(
        Long wishlistId,
        Long quoteId,
        String productNameZh,
        String productNameVi,
        String productImage,
        BigDecimal priceCny,
        BigDecimal priceVndEstimate,
        BigDecimal exchangeRate,
        LocalDateTime addedAt
) {}
