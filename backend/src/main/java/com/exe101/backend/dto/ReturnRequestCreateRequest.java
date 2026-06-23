package com.exe101.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReturnRequestCreateRequest(
        @NotNull Long customerId,
        @NotBlank String reason,
        @Size(max = 1000) String evidenceUrl
) {
}
