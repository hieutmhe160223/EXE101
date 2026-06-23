package com.exe101.backend.dto;

import java.time.LocalDateTime;

public record InspectionMediaResponse(
        Long id,
        String mediaType,
        String mediaUrl,
        String note,
        LocalDateTime createdAt
) {
}
