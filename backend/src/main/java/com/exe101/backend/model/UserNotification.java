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
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_notifications")
public class UserNotification extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType type;

    @Column(nullable = false, length = 200)
    private String title;

    @Lob
    private String body;

    @Column(length = 500)
    private String targetUrl;

    private LocalDateTime readAt;

    @Column(unique = true, length = 160)
    private String eventKey;

    protected UserNotification() {
    }

    public UserNotification(UserAccount user, NotificationType type, String title, String body, String targetUrl, String eventKey) {
        this.user = user;
        this.type = type;
        this.title = title;
        this.body = body;
        this.targetUrl = targetUrl;
        this.eventKey = eventKey;
    }

    public Long getId() { return id; }
    public UserAccount getUser() { return user; }
    public NotificationType getType() { return type; }
    public String getTitle() { return title; }
    public String getBody() { return body; }
    public String getTargetUrl() { return targetUrl; }
    public LocalDateTime getReadAt() { return readAt; }
    public String getEventKey() { return eventKey; }
    public void markRead() { if (readAt == null) readAt = LocalDateTime.now(); }
}
