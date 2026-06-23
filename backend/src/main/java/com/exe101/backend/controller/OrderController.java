package com.exe101.backend.controller;

import com.exe101.backend.dto.FinalPaymentRequest;
import com.exe101.backend.dto.OrderDetailResponse;
import com.exe101.backend.dto.OrderSummaryResponse;
import com.exe101.backend.dto.PaymentTransactionResponse;
import com.exe101.backend.dto.ReturnRequestCreateRequest;
import com.exe101.backend.dto.ReturnRequestResponse;
import com.exe101.backend.dto.VietnamWarehouseConfirmationRequest;
import com.exe101.backend.service.OrderService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<OrderSummaryResponse>> getOrderHistory(
            @RequestParam @NotNull Long customerId
    ) {
        return ResponseEntity.ok(orderService.getOrderHistory(customerId));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDetailResponse> getOrderDetail(
            @PathVariable Long orderId,
            @RequestParam @NotNull Long customerId
    ) {
        return ResponseEntity.ok(orderService.getOrderDetail(orderId, customerId));
    }

    @PostMapping("/{orderId}/vietnam-warehouse")
    public ResponseEntity<OrderDetailResponse> confirmVietnamWarehouse(
            @PathVariable Long orderId,
            @Valid @RequestBody VietnamWarehouseConfirmationRequest request
    ) {
        return ResponseEntity.ok(orderService.confirmVietnamWarehouse(orderId, request));
    }

    @PostMapping("/{orderId}/final-payment")
    public ResponseEntity<PaymentTransactionResponse> payFinalAmount(
            @PathVariable Long orderId,
            @Valid @RequestBody FinalPaymentRequest request
    ) {
        return ResponseEntity.ok(orderService.payFinalAmount(orderId, request));
    }

    @PostMapping("/{orderId}/return-requests")
    public ResponseEntity<ReturnRequestResponse> createReturnRequest(
            @PathVariable Long orderId,
            @Valid @RequestBody ReturnRequestCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createReturnRequest(orderId, request));
    }
}
