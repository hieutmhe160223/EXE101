package com.exe101.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "support_tickets")
public class SupportTicket extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private UserAccount customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_admin_id")
    private UserAccount assignedAdmin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private PurchaseOrder order;

    @Column(nullable = false, length = 200)
    private String subject;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TicketStatus status = TicketStatus.OPEN;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private SupportTopic topic = SupportTopic.GENERAL;

    @Column
    private LocalDateTime lastMessageAt;

    protected SupportTicket() {
    }
    public SupportTicket(UserAccount customer, String subject) {
        this(customer, subject, SupportTopic.GENERAL, null);
    }

    public SupportTicket(UserAccount customer, String subject, SupportTopic topic, PurchaseOrder order) {
        this.customer = customer;
        this.subject = subject;
        this.topic = topic == null ? SupportTopic.GENERAL : topic;
        this.order = order;
        this.lastMessageAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public UserAccount getCustomer() { return customer; }
    public UserAccount getAssignedAdmin() { return assignedAdmin; }
    public PurchaseOrder getOrder() { return order; }
    public String getSubject() { return subject; }
    public TicketStatus getStatus() { return status; }
    public SupportTopic getTopic() { return topic == null ? SupportTopic.GENERAL : topic; }
    public LocalDateTime getLastMessageAt() { return lastMessageAt == null ? getCreatedAt() : lastMessageAt; }

    public void assignTo(UserAccount admin) { this.assignedAdmin = admin; }
    public void changeStatus(TicketStatus status) { this.status = status; }

    public void markCustomerMessage() {
        this.lastMessageAt = LocalDateTime.now();
        if (status == TicketStatus.CLOSED || status == TicketStatus.RESOLVED) status = TicketStatus.OPEN;
        else if (status == TicketStatus.WAITING_CUSTOMER) status = TicketStatus.PROCESSING;
    }

    public void markAdminMessage(UserAccount admin) {
        this.assignedAdmin = admin;
        this.status = TicketStatus.WAITING_CUSTOMER;
        this.lastMessageAt = LocalDateTime.now();
    }
}
