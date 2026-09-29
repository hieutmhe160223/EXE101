package com.exe101.backend.service;

import com.exe101.backend.model.NotificationType;
import com.exe101.backend.model.PurchaseOrder;
import com.exe101.backend.model.Role;
import com.exe101.backend.model.SupportMessage;
import com.exe101.backend.model.SupportTicket;
import com.exe101.backend.model.SupportTopic;
import com.exe101.backend.model.TicketStatus;
import com.exe101.backend.model.UserAccount;
import com.exe101.backend.repository.PurchaseOrderRepository;
import com.exe101.backend.repository.SupportMessageRepository;
import com.exe101.backend.repository.SupportTicketRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SupportService {
    private final SupportTicketRepository tickets;
    private final SupportMessageRepository messages;
    private final PurchaseOrderRepository orders;
    private final CurrentUser currentUser;
    private final SupportStreamService stream;
    private final NotificationService notifications;

    public SupportService(SupportTicketRepository tickets, SupportMessageRepository messages,
                          PurchaseOrderRepository orders, CurrentUser currentUser,
                          SupportStreamService stream, NotificationService notifications) {
        this.tickets = tickets;
        this.messages = messages;
        this.orders = orders;
        this.currentUser = currentUser;
        this.stream = stream;
        this.notifications = notifications;
    }

    @Transactional(readOnly = true)
    public List<TicketView> customerTickets() {
        return tickets.findCustomerTickets(currentUser.id()).stream().map(this::ticketView).toList();
    }

    @Transactional(readOnly = true)
    public List<TicketView> adminTickets() {
        return tickets.findInbox().stream().map(this::ticketView).toList();
    }

    @Transactional(readOnly = true)
    public List<MessageView> customerMessages(Long ticketId) {
        customerTicket(ticketId);
        return messageViews(ticketId);
    }

    @Transactional(readOnly = true)
    public List<MessageView> adminMessages(Long ticketId) {
        requireTicket(ticketId);
        return messageViews(ticketId);
    }

    @Transactional
    public TicketView createTicket(SupportTopic topic, String subject, Long orderId,
                                   String initialMessage, String attachmentUrl) {
        UserAccount customer = currentUser.get();
        PurchaseOrder order = orderId == null ? null : orders.findByIdAndCustomerId(orderId, customer.getId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng của bạn"));
        SupportTopic safeTopic = topic == null ? SupportTopic.GENERAL : topic;
        String safeSubject = subject == null || subject.isBlank() ? defaultSubject(safeTopic, order) : subject.trim();
        SupportTicket ticket = tickets.save(new SupportTicket(customer, safeSubject, safeTopic, order));
        SupportMessage message = messages.save(new SupportMessage(ticket, customer, initialMessage.trim(), clean(attachmentUrl)));
        ticket.markCustomerMessage();
        tickets.save(ticket);
        publishAfterCommit(customer.getId(), "TICKET_CREATED", ticket.getId());
        return ticketView(ticket, message);
    }

    @Transactional
    public MessageView sendCustomerMessage(Long ticketId, String message, String attachmentUrl) {
        SupportTicket ticket = customerTicket(ticketId);
        ticket.markCustomerMessage();
        SupportMessage saved = messages.save(new SupportMessage(ticket, currentUser.get(), message.trim(), clean(attachmentUrl)));
        tickets.save(ticket);
        publishAfterCommit(ticket.getCustomer().getId(), "MESSAGE_CREATED", ticket.getId());
        return messageView(saved);
    }

    @Transactional
    public MessageView sendAdminMessage(Long ticketId, String message, String attachmentUrl) {
        SupportTicket ticket = requireTicket(ticketId);
        UserAccount admin = currentUser.get();
        ticket.markAdminMessage(admin);
        SupportMessage saved = messages.saveAndFlush(new SupportMessage(ticket, admin, message.trim(), clean(attachmentUrl)));
        tickets.save(ticket);
        notifications.create(ticket.getCustomer(), NotificationType.SYSTEM,
                "Hỗ trợ Yufiz vừa phản hồi", message.length() > 140 ? message.substring(0, 140) + "…" : message,
                "/chat?ticket=" + ticket.getId(), "SUPPORT_REPLY:" + saved.getId());
        publishAfterCommit(ticket.getCustomer().getId(), "MESSAGE_CREATED", ticket.getId());
        return messageView(saved);
    }

    @Transactional
    public TicketView updateTicket(Long ticketId, TicketStatus status, boolean assignToMe) {
        SupportTicket ticket = requireTicket(ticketId);
        if (assignToMe) ticket.assignTo(currentUser.get());
        if (status != null) ticket.changeStatus(status);
        tickets.save(ticket);
        publishAfterCommit(ticket.getCustomer().getId(), "TICKET_UPDATED", ticket.getId());
        return ticketView(ticket);
    }

    @Transactional
    public TicketView closeCustomerTicket(Long ticketId) {
        SupportTicket ticket = customerTicket(ticketId);
        ticket.changeStatus(TicketStatus.CLOSED);
        tickets.save(ticket);
        publishAfterCommit(ticket.getCustomer().getId(), "TICKET_UPDATED", ticket.getId());
        return ticketView(ticket);
    }

    @Transactional(readOnly = true)
    public List<OrderOption> customerOrders() {
        return orders.findByCustomerIdOrderByCreatedAtDesc(currentUser.id()).stream()
                .map(order -> new OrderOption(order.getId(), order.getOrderCode(), order.getProductName(), order.getStatus().name()))
                .toList();
    }

    // Compatibility for the original single-thread chat API.
    @Transactional(readOnly = true)
    public List<LegacyMessage> legacyCustomerMessages() {
        return messages.findByTicketCustomerIdOrderByCreatedAtDesc(currentUser.id()).stream()
                .map(this::legacyMessage).toList();
    }

    @Transactional
    public MessageView legacyCustomerSend(String message) {
        UserAccount customer = currentUser.get();
        SupportTicket ticket = tickets.findFirstByCustomerIdAndStatusOrderByCreatedAtDesc(customer.getId(), TicketStatus.OPEN)
                .orElseGet(() -> tickets.save(new SupportTicket(customer, "Hỗ trợ khách hàng")));
        ticket.markCustomerMessage();
        SupportMessage saved = messages.save(new SupportMessage(ticket, customer, message.trim()));
        tickets.save(ticket);
        publishAfterCommit(customer.getId(), "MESSAGE_CREATED", ticket.getId());
        return messageView(saved);
    }

    @Transactional(readOnly = true)
    public List<LegacyTicket> legacyAdminTickets() {
        return tickets.findInbox().stream().map(ticket -> new LegacyTicket(ticket.getId(),
                ticket.getCustomer().getFullName(), ticket.getSubject(), ticket.getStatus())).toList();
    }

    @Transactional(readOnly = true)
    public List<LegacyMessage> legacyAdminMessages(Long ticketId) {
        return messages.findByTicketIdOrderByCreatedAtDesc(ticketId).stream()
                .map(this::legacyMessage).toList();
    }

    private SupportTicket customerTicket(Long id) {
        return tickets.findByIdAndCustomerId(id, currentUser.id())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy cuộc hội thoại"));
    }

    private SupportTicket requireTicket(Long id) {
        return tickets.findById(id).orElseThrow(() -> new EntityNotFoundException("Không tìm thấy cuộc hội thoại"));
    }

    private List<MessageView> messageViews(Long ticketId) {
        return messages.findByTicketIdOrderByCreatedAtAsc(ticketId).stream().map(this::messageView).toList();
    }

    private TicketView ticketView(SupportTicket ticket) {
        return ticketView(ticket, messages.findFirstByTicketIdOrderByCreatedAtDesc(ticket.getId()).orElse(null));
    }

    private TicketView ticketView(SupportTicket ticket, SupportMessage lastMessage) {
        PurchaseOrder order = ticket.getOrder();
        UserAccount admin = ticket.getAssignedAdmin();
        UserAccount customer = ticket.getCustomer();
        return new TicketView(ticket.getId(), ticket.getSubject(), ticket.getTopic(), ticket.getStatus(),
                order == null ? null : order.getId(), order == null ? null : order.getOrderCode(),
                customer.getId(), customer.getFullName(), customer.getEmail(),
                admin == null ? null : admin.getId(), admin == null ? null : admin.getFullName(),
                lastMessage == null ? null : lastMessage.getMessage(), ticket.getCreatedAt(), ticket.getLastMessageAt());
    }

    private MessageView messageView(SupportMessage message) {
        UserAccount sender = message.getSender();
        return new MessageView(message.getId(), message.getTicket().getId(), sender.getId(), sender.getFullName(),
                sender.getRole(), message.getMessage(), message.getAttachmentUrl(), message.getCreatedAt());
    }

    private LegacyMessage legacyMessage(SupportMessage message) {
        return new LegacyMessage(message.getId(), message.getSender().getFullName(), message.getMessage(), message.getCreatedAt());
    }

    private String defaultSubject(SupportTopic topic, PurchaseOrder order) {
        String suffix = order == null ? "" : " · " + order.getOrderCode();
        return switch (topic) {
            case BARGAIN -> "Yêu cầu mặc cả" + suffix;
            case SPECIAL_ORDER -> "Đặt hàng đặc biệt" + suffix;
            case GENERAL -> "Hỗ trợ khách hàng" + suffix;
        };
    }

    private String clean(String value) { return value == null || value.isBlank() ? null : value.trim(); }

    private void publishAfterCommit(Long customerId, String type, Long ticketId) {
        Runnable publish = () -> stream.publish(customerId, new SupportStreamService.SupportEvent(type, ticketId));
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCommit() { publish.run(); }
            });
        } else publish.run();
    }

    public record TicketView(Long id, String subject, SupportTopic topic, TicketStatus status,
                             Long orderId, String orderCode, Long customerId, String customerName,
                             String customerEmail, Long assignedAdminId, String assignedAdminName,
                             String lastMessage, LocalDateTime createdAt, LocalDateTime updatedAt) {}
    public record MessageView(Long id, Long ticketId, Long senderId, String senderName, Role senderRole,
                              String message, String attachmentUrl, LocalDateTime createdAt) {}
    public record OrderOption(Long id, String orderCode, String productName, String status) {}
    public record LegacyMessage(Long id, String sender, String message, LocalDateTime createdAt) {}
    public record LegacyTicket(Long id, String customer, String subject, TicketStatus status) {}
}
