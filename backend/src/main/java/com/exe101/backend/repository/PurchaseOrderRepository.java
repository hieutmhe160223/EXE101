package com.exe101.backend.repository;

import com.exe101.backend.model.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select o from PurchaseOrder o where o.id = :id")
    Optional<PurchaseOrder> lockById(@org.springframework.data.repository.query.Param("id") Long id);

    List<PurchaseOrder> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    Optional<PurchaseOrder> findByIdAndCustomerId(Long id, Long customerId);
    Optional<PurchaseOrder> findByCustomerIdAndRequestKey(Long customerId, String requestKey);
}
