package com.exe101.backend.service;

import com.exe101.backend.model.NotificationType;
import com.exe101.backend.model.UserAccount;
import com.exe101.backend.model.UserNotification;
import com.exe101.backend.repository.UserNotificationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {
    private final UserNotificationRepository notifications;
    private final NotificationStreamService stream;
    private final CurrentUser currentUser;

    public NotificationService(UserNotificationRepository notifications, NotificationStreamService stream, CurrentUser currentUser) {
        this.notifications = notifications;
        this.stream = stream;
        this.currentUser = currentUser;
    }

    @Transactional
    public NotificationView create(UserAccount user, NotificationType type, String title, String body, String targetUrl, String eventKey) {
        var existing = notifications.findByEventKey(eventKey);
        if (existing.isPresent()) return view(existing.get());
        UserNotification notification = notifications.saveAndFlush(new UserNotification(user, type, title, body, targetUrl, eventKey));
        NotificationView result = view(notification);
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCommit() { stream.publish(user.getId(), result); }
            });
        } else {
            stream.publish(user.getId(), result);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<NotificationView> list() {
        return notifications.findTop200ByUserIdOrderByCreatedAtDesc(currentUser.id()).stream().map(this::view).toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount() { return notifications.countByUserIdAndReadAtIsNull(currentUser.id()); }

    @Transactional
    public NotificationView read(Long id) {
        UserNotification notification = notifications.findByIdAndUserId(id, currentUser.id())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông báo"));
        notification.markRead();
        return view(notification);
    }

    @Transactional
    public long readAll() {
        return notifications.markAllRead(currentUser.id());
    }

    private NotificationView view(UserNotification notification) {
        return new NotificationView(notification.getId(), notification.getType(), notification.getTitle(), notification.getBody(),
                notification.getTargetUrl(), notification.getReadAt(), notification.getCreatedAt());
    }

    public record NotificationView(Long id, NotificationType type, String title, String body, String targetUrl,
                                   LocalDateTime readAt, LocalDateTime createdAt) {}
}
