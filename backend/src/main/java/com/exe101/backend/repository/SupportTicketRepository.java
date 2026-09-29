package com.exe101.backend.repository;

import com.exe101.backend.model.SupportTicket;
import com.exe101.backend.model.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    @Query("select t from SupportTicket t where t.customer.id = :customerId order by coalesce(t.lastMessageAt, t.createdAt) desc")
    List<SupportTicket> findCustomerTickets(@Param("customerId") Long customerId);

    @Query("select t from SupportTicket t order by coalesce(t.lastMessageAt, t.createdAt) desc")
    List<SupportTicket> findInbox();

    Optional<SupportTicket> findByIdAndCustomerId(Long id, Long customerId);

    Optional<SupportTicket> findFirstByCustomerIdAndStatusOrderByCreatedAtDesc(Long customerId, TicketStatus status);
}
