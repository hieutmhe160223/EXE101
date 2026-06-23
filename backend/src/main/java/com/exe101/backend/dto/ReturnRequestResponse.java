package com.exe101.backend.dto;

import com.exe101.backend.model.ReturnRequestStatus;

import java.time.LocalDateTime;

public record ReturnRequestResponse(
        Long id,
        String reason,
        String evidenceUrl,
        ReturnRequestStatus status,
        String adminNote,
        LocalDateTime createdAt
) {
}
