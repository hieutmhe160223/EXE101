package com.exe101.backend.repository;

import com.exe101.backend.model.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    List<PurchaseOrder> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    Optional<PurchaseOrder> findByIdAndCustomerId(Long id, Long customerId);
}
