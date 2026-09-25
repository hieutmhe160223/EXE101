package com.exe101.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Service
public class NotificationStreamService {
    private final ConcurrentHashMap<Long, CopyOnWriteArraySet<SseEmitter>> clients = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(30L * 60L * 1000L);
        clients.computeIfAbsent(userId, ignored -> new CopyOnWriteArraySet<>()).add(emitter);
        Runnable remove = () -> remove(userId, emitter);
        emitter.onCompletion(remove);
        emitter.onTimeout(remove);
        emitter.onError(error -> remove.run());
        try {
            emitter.send(SseEmitter.event().name("connected").data("ok"));
        } catch (IOException error) {
            remove.run();
            emitter.completeWithError(error);
        }
        return emitter;
    }

    public void publish(Long userId, NotificationService.NotificationView notification) {
        Set<SseEmitter> emitters = clients.getOrDefault(userId, new CopyOnWriteArraySet<>());
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("notification").data(notification));
            } catch (IOException | IllegalStateException error) {
                remove(userId, emitter);
            }
        }
    }

    private void remove(Long userId, SseEmitter emitter) {
        CopyOnWriteArraySet<SseEmitter> emitters = clients.get(userId);
        if (emitters == null) return;
        emitters.remove(emitter);
        if (emitters.isEmpty()) clients.remove(userId, emitters);
    }
}
