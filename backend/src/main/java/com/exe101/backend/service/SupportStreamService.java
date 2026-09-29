package com.exe101.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Service
public class SupportStreamService {
    private static final long TIMEOUT = 30L * 60L * 1000L;
    private final ConcurrentHashMap<Long, CopyOnWriteArraySet<SseEmitter>> customers = new ConcurrentHashMap<>();
    private final CopyOnWriteArraySet<SseEmitter> admins = new CopyOnWriteArraySet<>();

    public SseEmitter subscribeCustomer(Long customerId) {
        SseEmitter emitter = new SseEmitter(TIMEOUT);
        customers.computeIfAbsent(customerId, ignored -> new CopyOnWriteArraySet<>()).add(emitter);
        Runnable remove = () -> removeCustomer(customerId, emitter);
        configure(emitter, remove);
        return emitter;
    }

    public SseEmitter subscribeAdmin() {
        SseEmitter emitter = new SseEmitter(TIMEOUT);
        admins.add(emitter);
        configure(emitter, () -> admins.remove(emitter));
        return emitter;
    }

    public void publish(Long customerId, SupportEvent event) {
        send(customers.getOrDefault(customerId, new CopyOnWriteArraySet<>()), event,
                emitter -> removeCustomer(customerId, emitter));
        send(admins, event, admins::remove);
    }

    private void configure(SseEmitter emitter, Runnable remove) {
        emitter.onCompletion(remove);
        emitter.onTimeout(remove);
        emitter.onError(error -> remove.run());
        try {
            emitter.send(SseEmitter.event().name("connected").data("ok"));
        } catch (IOException error) {
            remove.run();
            emitter.completeWithError(error);
        }
    }

    private void send(Set<SseEmitter> targets, SupportEvent event, java.util.function.Consumer<SseEmitter> remove) {
        for (SseEmitter emitter : targets) {
            try {
                emitter.send(SseEmitter.event().name("support").data(event));
            } catch (IOException | IllegalStateException error) {
                remove.accept(emitter);
            }
        }
    }

    private void removeCustomer(Long customerId, SseEmitter emitter) {
        CopyOnWriteArraySet<SseEmitter> emitters = customers.get(customerId);
        if (emitters == null) return;
        emitters.remove(emitter);
        if (emitters.isEmpty()) customers.remove(customerId, emitters);
    }

    public record SupportEvent(String type, Long ticketId) {}
}
