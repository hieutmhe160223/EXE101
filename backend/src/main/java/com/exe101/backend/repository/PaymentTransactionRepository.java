package com.exe101.backend.repository;

import com.exe101.backend.model.PaymentTransaction;
import com.exe101.backend.model.PaymentType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    Optional<PaymentTransaction> findFirstByOrderIdAndTypeOrderByCreatedAtDesc(Long orderId, PaymentType type);
    Optional<PaymentTransaction> findByMerchantReference(String reference);
    boolean existsBySettlementKey(String key);
    boolean existsByOrderId(Long orderId);
    boolean existsByOrderIdAndStatusIn(Long orderId, java.util.Collection<com.exe101.backend.model.PaymentStatus> statuses);
    @org.springframework.data.jpa.repository.Query("select p.id from PaymentTransaction p where p.status = com.exe101.backend.model.PaymentStatus.PENDING and p.method in (com.exe101.backend.model.PaymentMethod.MOMO, com.exe101.backend.model.PaymentMethod.ZALOPAY) and p.createdAt > :cutoff and (p.lastCheckedAt is null or p.lastCheckedAt < :before) order by p.lastCheckedAt asc, p.createdAt asc")
    java.util.List<Long> pendingForReconciliation(@org.springframework.data.repository.query.Param("cutoff") java.time.LocalDateTime cutoff,
            @org.springframework.data.repository.query.Param("before") java.time.LocalDateTime before, org.springframework.data.domain.Pageable page);
    java.util.List<PaymentTransaction> findByMethodAndStatusOrderByCreatedAtAsc(com.exe101.backend.model.PaymentMethod method, com.exe101.backend.model.PaymentStatus status);
}
