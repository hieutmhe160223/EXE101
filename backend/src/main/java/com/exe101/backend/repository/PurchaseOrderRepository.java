package com.exe101.backend.repository;

import com.exe101.backend.dto.AdminDTO;
import com.exe101.backend.model.PurchaseOrder;
import com.exe101.backend.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    // Các hàm cũ của bạn
    List<PurchaseOrder> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    Optional<PurchaseOrder> findByIdAndCustomerId(Long id, Long customerId);

        @Query("""
            SELECT p FROM PurchaseOrder p
            JOIN p.customer c
            LEFT JOIN p.productQuote q
            WHERE (:keyword IS NULL OR LOWER(p.orderCode) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:status IS NULL OR p.status = :status)
            """)
        Page<PurchaseOrder> searchOrdersForAdmin(
            @Param("keyword") String keyword,
            @Param("status") OrderStatus status,
            Pageable pageable
        );


    @Query("SELECT new com.exe101.backend.dto.AdminDTO$OrderStatusCount(p.status, COUNT(p)) FROM PurchaseOrder p GROUP BY p.status")
    List<AdminDTO.OrderStatusCount> countOrdersByStatus();

    List<PurchaseOrder> findTop5ByOrderByCreatedAtDesc();
}