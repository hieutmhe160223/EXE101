package com.exe101.backend.repository;

import com.exe101.backend.model.ReturnRequest;
import com.exe101.backend.model.ReturnRequestStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {

    List<ReturnRequest> findByOrderIdOrderByCreatedAtDesc(Long orderId);

    @Query(value = """
        SELECT r FROM ReturnRequest r
        JOIN r.order o
        JOIN r.customer c
        WHERE (:keyword IS NULL OR LOWER(o.orderCode) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR r.reason LIKE CONCAT('%', :keyword, '%'))
          AND (:status IS NULL OR r.status = :status)
        """, countQuery = """
        SELECT COUNT(r) FROM ReturnRequest r
        JOIN r.order o
        JOIN r.customer c
        WHERE (:keyword IS NULL OR LOWER(o.orderCode) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR r.reason LIKE CONCAT('%', :keyword, '%'))
          AND (:status IS NULL OR r.status = :status)
        """)
    Page<ReturnRequest> searchForAdmin(
        @Param("keyword") String keyword,
        @Param("status") ReturnRequestStatus status,
        Pageable pageable
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM ReturnRequest r WHERE r.id = :id")
    Optional<ReturnRequest> lockById(@Param("id") Long id);

    boolean existsByOrderIdAndStatusIn(Long orderId, Collection<ReturnRequestStatus> statuses);
}
