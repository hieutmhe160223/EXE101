package com.exe101.backend.dto;

import com.exe101.backend.model.ReturnRequestStatus;

import java.time.LocalDateTime;
import java.math.BigDecimal;

public record ReturnRequestResponse(
        Long id,
        String reason,
        String evidenceUrl,
        ReturnRequestStatus status,
        String adminNote,
        BigDecimal requestedAmountVnd,
        BigDecimal approvedAmountVnd,
        LocalDateTime reviewedAt,
        LocalDateTime createdAt
) {
}
