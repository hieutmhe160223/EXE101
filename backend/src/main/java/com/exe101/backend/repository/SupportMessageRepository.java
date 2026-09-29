package com.exe101.backend.repository;

import com.exe101.backend.model.SupportMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SupportMessageRepository extends JpaRepository<SupportMessage, Long> {
    List<SupportMessage> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
    List<SupportMessage> findByTicketIdOrderByCreatedAtDesc(Long ticketId);
    List<SupportMessage> findByTicketCustomerIdOrderByCreatedAtDesc(Long customerId);
    Optional<SupportMessage> findFirstByTicketIdOrderByCreatedAtDesc(Long ticketId);
}
