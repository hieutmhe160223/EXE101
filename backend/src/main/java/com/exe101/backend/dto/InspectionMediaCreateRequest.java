package com.exe101.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record InspectionMediaCreateRequest(
        @NotBlank @Size(max = 20) String mediaType,
        @NotBlank @Size(max = 1000) String mediaUrl,
        @Size(max = 500) String note
) {
}
