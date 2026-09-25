package com.exe101.backend.service;

import com.exe101.backend.repository.PaymentTransactionRepository;
import java.time.LocalDateTime;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.*;
import org.springframework.stereotype.Component;
import org.springframework.data.domain.PageRequest;

@Component @EnableScheduling
@ConditionalOnProperty(name="app.payment-reconciliation-enabled",havingValue="true")
public class PaymentReconciliationJob {
    private final PaymentTransactionRepository payments;
    private final DepositPaymentService service;
    private static final org.slf4j.Logger log=org.slf4j.LoggerFactory.getLogger(PaymentReconciliationJob.class);
    public PaymentReconciliationJob(PaymentTransactionRepository payments,DepositPaymentService service) { this.payments=payments;this.service=service; }
    @Scheduled(fixedDelay=60000,initialDelay=60000)
    public void reconcile() {
        var now=LocalDateTime.now();
        for(Long id:payments.pendingForReconciliation(now.minusHours(48),now.minusMinutes(1),PageRequest.of(0,20))) {
            try { service.reconcileScheduled(id); }
            catch(Exception ex) { log.warn("Payment {} requires reconciliation review",id); }
        }
    }
}
