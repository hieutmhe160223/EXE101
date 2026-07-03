package com.exe101.backend.controller;

import com.exe101.backend.dto.PaymentInfoResponse;
import com.exe101.backend.model.PaymentMethod;
import com.exe101.backend.model.PurchaseOrder;
import com.exe101.backend.repository.PurchaseOrderRepository;
import com.exe101.backend.service.MoMoService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Value("${vietqr.bank-code}")
    private String bankCode;

    @Value("${vietqr.account-number}")
    private String accountNumber;

    @Value("${vietqr.account-name}")
    private String accountName;

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final MoMoService momoService;

    public PaymentController(
            PurchaseOrderRepository purchaseOrderRepository,
            MoMoService momoService
    ) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.momoService = momoService;
    }

    @GetMapping("/orders/{orderId}/payment-info")
    public ResponseEntity<PaymentInfoResponse> getPaymentInfo(
            @PathVariable Long orderId,
            @RequestParam PaymentMethod method
    ) throws Exception {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        BigDecimal amount = order.getDepositAmountVnd();
        String orderCode = order.getOrderCode();

        return switch (method) {
            case BANK_TRANSFER -> ResponseEntity.ok(buildBankTransferInfo(orderCode, amount));
            case MOMO -> ResponseEntity.ok(buildMomoInfo(orderCode, amount));
            default -> throw new IllegalArgumentException("Payment method not supported yet: " + method);
        };
    }

    private PaymentInfoResponse buildBankTransferInfo(String orderCode, BigDecimal amount) {
        String qrUrl = "https://img.vietqr.io/image/"
                + bankCode + "-" + accountNumber
                + "-compact.png?amount=" + amount.longValue()
                + "&addInfo=" + orderCode;

        return new PaymentInfoResponse(
                PaymentMethod.BANK_TRANSFER,
                amount,
                orderCode,
                "Vietcombank",
                accountNumber,
                accountName,
                orderCode,
                qrUrl,
                null
        );
    }

    private PaymentInfoResponse buildMomoInfo(String orderCode, BigDecimal amount) throws Exception {
        String payUrl = momoService.createPaymentUrl(orderCode, amount);
        return new PaymentInfoResponse(
                PaymentMethod.MOMO,
                amount,
                orderCode,
                null, null, null, null, null,
                payUrl
        );
    }
}