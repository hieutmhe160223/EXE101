package com.exe101.backend.dto;

import com.exe101.backend.model.OrderStatus;

import java.time.LocalDateTime;

public record OrderTimelineItemResponse(
        OrderStatus status,
        String label,
        boolean reached,
        String location,
        String note,
        LocalDateTime createdAt
) {
}
