package com.exe101.backend.dto;

import com.exe101.backend.model.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CreateOrderResponse(
        // Thông tin đơn hàng
        Long orderId,
        String orderCode,
        OrderStatus status,
        Integer quantity,

        // Thông tin sản phẩm
        String productName,
        String productImageUrl,
        String variantSelected,

        // Địa chỉ giao hàng
        String shippingAddress,
        String customerNote,

        // Bảng chi phí
        BigDecimal productPriceCny,
        BigDecimal domesticShippingFeeCny,
        BigDecimal serviceFeeVnd,
        BigDecimal internationalShippingFeeVnd,
        BigDecimal exchangeRate,

        // Tổng tiền
        BigDecimal totalAmountVnd,
        BigDecimal depositAmountVnd,
        BigDecimal finalAmountVnd,

        LocalDateTime createdAt
) {}