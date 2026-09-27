package com.exe101.backend.controller;

import com.exe101.backend.service.CurrentUser;
import com.exe101.backend.service.NotificationService;
import com.exe101.backend.service.NotificationStreamService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/notifications")
public class NotificationController {
    private final NotificationService notifications;
    private final NotificationStreamService stream;
    private final CurrentUser currentUser;

    public NotificationController(NotificationService notifications, NotificationStreamService stream, CurrentUser currentUser) {
        this.notifications = notifications;
        this.stream = stream;
        this.currentUser = currentUser;
    }

    @GetMapping public List<NotificationService.NotificationView> list() { return notifications.list(); }
    @GetMapping("/unread-count") public Map<String, Long> unreadCount() { return Map.of("count", notifications.unreadCount()); }
    @PostMapping("/{id}/read") public NotificationService.NotificationView read(@PathVariable Long id) { return notifications.read(id); }
    @PostMapping("/read-all") public Map<String, Long> readAll() { return Map.of("updated", notifications.readAll()); }
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream() { return stream.subscribe(currentUser.id()); }
}
