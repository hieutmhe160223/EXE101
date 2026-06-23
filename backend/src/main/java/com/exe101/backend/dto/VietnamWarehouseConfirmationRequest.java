package com.exe101.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

import java.util.List;

public record VietnamWarehouseConfirmationRequest(
        @Size(max = 200) String location,
        @Size(max = 1000) String note,
        @Valid List<InspectionMediaCreateRequest> inspectionMedia
) {
}
