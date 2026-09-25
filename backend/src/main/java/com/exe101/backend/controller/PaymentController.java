package com.exe101.backend.controller;
import com.exe101.backend.model.PaymentMethod;
import com.exe101.backend.service.*;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api")
public class PaymentController {
    private final DepositPaymentService payments;
    private final PaymentGateway gateway;
    public PaymentController(DepositPaymentService payments, PaymentGateway gateway) { this.payments=payments; this.gateway=gateway; }
    public record CreatePayment(@NotNull PaymentMethod method) {}
    public record CancelPayment(@Size(max=500) String reason) {}
    public record ConfirmBank(@NotNull @DecimalMin("1") BigDecimal amount,
            @NotBlank @Size(max=100) String transactionCode, @NotBlank @Size(max=700) String note) {}
    @GetMapping("/payments/methods")
    public List<Map<String,Object>> methods() {
        return List.of(PaymentMethod.WALLET,PaymentMethod.BANK_TRANSFER,PaymentMethod.MOMO,PaymentMethod.ZALOPAY).stream()
                .map(method -> Map.<String,Object>of("method",method,"available",method==PaymentMethod.WALLET||gateway.available(method))).toList();
    }
    @PostMapping("/orders/{id}/deposit-payments")
    public Object create(@PathVariable Long id,@Valid @RequestBody CreatePayment request) { return payments.create(id,request.method()); }
    @PostMapping("/payments/{id}/cancel")
    public Object cancel(@PathVariable Long id,@Valid @RequestBody CancelPayment request) {
        return payments.cancel(id,request.reason());
    }
    @GetMapping("/orders/{id}/deposit-payments/latest")
    public ResponseEntity<?> latest(@PathVariable Long id) {
        var result=payments.latest(id); return result==null ? ResponseEntity.noContent().build() : ResponseEntity.ok(result);
    }
    @PostMapping("/payments/momo/webhook")
    public ResponseEntity<Void> momo(@RequestBody JsonNode body) {
        payments.settle(PaymentMethod.MOMO,gateway.verifyMomo(body));
        return ResponseEntity.noContent().build();
    }
    @PostMapping("/orders/{id}/final-payments")
    public Object createFinal(@PathVariable Long id,@Valid @RequestBody CreatePayment request) {
        return payments.create(id,request.method(),com.exe101.backend.model.PaymentType.FINAL_30);
    }
    @GetMapping("/orders/{id}/final-payments/latest")
    public ResponseEntity<?> latestFinal(@PathVariable Long id) {
        var result=payments.latest(id,com.exe101.backend.model.PaymentType.FINAL_30);
        return result==null ? ResponseEntity.noContent().build() : ResponseEntity.ok(result);
    }
    @PostMapping("/payments/zalopay/webhook")
    public Map<String,Object> zalo(@RequestBody JsonNode body) {
        payments.settle(PaymentMethod.ZALOPAY,gateway.verifyZalo(body));
        return Map.of("return_code",1,"return_message","success");
    }
    @GetMapping("/admin/payments/pending-bank")
    public Object pendingBank() { return payments.pendingBank(); }
    @PostMapping("/payments/{id}/reconcile")
    public Object reconcile(@PathVariable Long id) { return payments.reconcile(id); }
    @PostMapping("/admin/payments/{id}/confirm-bank")
    public Object confirmBank(@PathVariable Long id,@Valid @RequestBody ConfirmBank request) {
        return payments.confirmBank(id,request.amount(),request.transactionCode().trim(),request.note());
    }
}
