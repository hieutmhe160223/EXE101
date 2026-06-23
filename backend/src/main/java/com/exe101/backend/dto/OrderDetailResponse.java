package com.exe101.backend.dto;

import com.exe101.backend.model.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderDetailResponse(
        Long id,
        String orderCode,
        OrderStatus status,
        Integer quantity,
        BigDecimal totalAmountVnd,
        BigDecimal depositAmountVnd,
        BigDecimal finalAmountVnd,
        BigDecimal paidAmountVnd,
        String shippingAddress,
        String customerNote,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<OrderTimelineItemResponse> timeline,
        List<InspectionMediaResponse> inspectionMedia,
        List<ReturnRequestResponse> returnRequests
) {
}
