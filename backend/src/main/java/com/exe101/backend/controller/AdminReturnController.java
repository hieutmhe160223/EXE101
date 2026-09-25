package com.exe101.backend.controller;

import com.exe101.backend.service.RefundService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/admin/returns")
public class AdminReturnController {
    private final RefundService refunds;

    public AdminReturnController(RefundService refunds) {
        this.refunds = refunds;
    }

    @PostMapping("/{id}/approve")
    public RefundService.RefundView approve(@PathVariable Long id, @Valid @RequestBody ApproveRefund request) {
        return refunds.approve(id, request.amountVnd(), request.note());
    }

    @PostMapping("/{id}/reject")
    public RefundService.RefundView reject(@PathVariable Long id, @Valid @RequestBody RejectRefund request) {
        return refunds.reject(id, request.note());
    }

    public record ApproveRefund(
            @NotNull @DecimalMin("1") BigDecimal amountVnd,
            @NotBlank @Size(max = 1000) String note
    ) {}

    public record RejectRefund(@NotBlank @Size(max = 1000) String note) {}
}
