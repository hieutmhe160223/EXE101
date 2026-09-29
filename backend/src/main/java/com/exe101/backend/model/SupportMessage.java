package com.exe101.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "support_messages")
public class SupportMessage extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ticket_id", nullable = false)
    private SupportTicket ticket;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_id", nullable = false)
    private UserAccount sender;

    @Lob
    @Column(nullable = false)
    private String message;

    @Column(length = 1000)
    private String attachmentUrl;

    protected SupportMessage() {
    }
    public SupportMessage(SupportTicket ticket, UserAccount sender, String message) {
        this(ticket, sender, message, null);
    }

    public SupportMessage(SupportTicket ticket, UserAccount sender, String message, String attachmentUrl) {
        this.ticket = ticket;
        this.sender = sender;
        this.message = message;
        this.attachmentUrl = attachmentUrl;
    }

    public Long getId() { return id; }
    public SupportTicket getTicket() { return ticket; }
    public UserAccount getSender() { return sender; }
    public String getMessage() { return message; }
    public String getAttachmentUrl() { return attachmentUrl; }
}
