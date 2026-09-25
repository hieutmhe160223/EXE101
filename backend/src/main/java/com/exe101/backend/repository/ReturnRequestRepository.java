package com.exe101.backend.repository;

import com.exe101.backend.model.ReturnRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {

    List<ReturnRequest> findByOrderIdOrderByCreatedAtDesc(Long orderId);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select r from ReturnRequest r where r.id=:id")
    java.util.Optional<ReturnRequest> lockById(@org.springframework.data.repository.query.Param("id") Long id);
    boolean existsByOrderIdAndStatusIn(Long orderId,java.util.Collection<com.exe101.backend.model.ReturnRequestStatus> statuses);
}
