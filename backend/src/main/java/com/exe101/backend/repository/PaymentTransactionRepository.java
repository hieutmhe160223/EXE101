package com.exe101.backend.repository;

import com.exe101.backend.model.PaymentTransaction;
import com.exe101.backend.model.PaymentType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    Optional<PaymentTransaction> findFirstByOrderIdAndTypeOrderByCreatedAtDesc(Long orderId, PaymentType type);
}
