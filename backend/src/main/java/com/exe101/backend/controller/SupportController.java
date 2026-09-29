package com.exe101.backend.controller;

import com.exe101.backend.model.SupportTopic;
import com.exe101.backend.model.TicketStatus;
import com.exe101.backend.service.CurrentUser;
import com.exe101.backend.service.SupportService;
import com.exe101.backend.service.SupportStreamService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api")
public class SupportController {
    private final SupportService support;
    private final SupportStreamService stream;
    private final CurrentUser currentUser;

    public SupportController(SupportService support, SupportStreamService stream, CurrentUser currentUser) {
        this.support = support;
        this.stream = stream;
        this.currentUser = currentUser;
    }

    @GetMapping("/user/support/tickets")
    public List<SupportService.TicketView> customerTickets() { return support.customerTickets(); }
    @PostMapping("/user/support/tickets")
    public ResponseEntity<SupportService.TicketView> createTicket(@Valid @RequestBody CreateTicketBody body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(support.createTicket(body.topic(), body.subject(), body.orderId(), body.initialMessage(), body.attachmentUrl()));
    }
    @GetMapping("/user/support/tickets/{id}/messages")
    public List<SupportService.MessageView> customerMessages(@PathVariable Long id) { return support.customerMessages(id); }
    @PostMapping("/user/support/tickets/{id}/messages")
    public SupportService.MessageView customerMessage(@PathVariable Long id, @Valid @RequestBody MessageBody body) {
        return support.sendCustomerMessage(id, body.message(), body.attachmentUrl());
    }
    @PatchMapping("/user/support/tickets/{id}/close")
    public SupportService.TicketView closeTicket(@PathVariable Long id) { return support.closeCustomerTicket(id); }
    @GetMapping("/user/support/orders")
    public List<SupportService.OrderOption> customerOrders() { return support.customerOrders(); }
    @GetMapping(value = "/user/support/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter customerStream() { return stream.subscribeCustomer(currentUser.id()); }

    @GetMapping("/admin/support/tickets")
    public List<SupportService.TicketView> adminTickets() { return support.adminTickets(); }
    @GetMapping("/admin/support/tickets/{id}/messages")
    public List<SupportService.MessageView> adminMessages(@PathVariable Long id) { return support.adminMessages(id); }
    @PostMapping("/admin/support/tickets/{id}/messages")
    public SupportService.MessageView adminMessage(@PathVariable Long id, @Valid @RequestBody MessageBody body) {
        return support.sendAdminMessage(id, body.message(), body.attachmentUrl());
    }
    @PatchMapping("/admin/support/tickets/{id}")
    public SupportService.TicketView updateTicket(@PathVariable Long id, @RequestBody UpdateTicketBody body) {
        return support.updateTicket(id, body.status(), Boolean.TRUE.equals(body.assignToMe()));
    }
    @GetMapping(value = "/admin/support/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter adminStream() { return stream.subscribeAdmin(); }

    // Compatibility endpoints for the original single-thread chat client.
    @GetMapping("/user/support")
    public List<SupportService.LegacyMessage> legacyCustomerMessages() { return support.legacyCustomerMessages(); }
    @PostMapping("/user/support")
    public SupportService.MessageView legacyCustomerMessage(@Valid @RequestBody MessageBody body) {
        return support.legacyCustomerSend(body.message());
    }
    @GetMapping("/admin/support")
    public List<SupportService.LegacyTicket> legacyAdminTickets() { return support.legacyAdminTickets(); }
    @GetMapping("/admin/support/{id}/messages")
    public List<SupportService.LegacyMessage> legacyAdminMessages(@PathVariable Long id) { return support.legacyAdminMessages(id); }
    @PostMapping("/admin/support/{id}/messages")
    public SupportService.MessageView legacyAdminMessage(@PathVariable Long id, @Valid @RequestBody MessageBody body) {
        return support.sendAdminMessage(id, body.message(), body.attachmentUrl());
    }

    public record CreateTicketBody(SupportTopic topic, @Size(max = 200) String subject, Long orderId,
                                   @NotBlank @Size(max = 5000) String initialMessage,
                                   @Size(max = 1000) String attachmentUrl) {}
    public record MessageBody(@NotBlank @Size(max = 5000) String message,
                              @Size(max = 1000) String attachmentUrl) {}
    public record UpdateTicketBody(TicketStatus status, Boolean assignToMe) {}
}
