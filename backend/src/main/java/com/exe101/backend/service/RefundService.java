package com.exe101.backend.service;

import com.exe101.backend.model.OrderStatus;
import com.exe101.backend.model.OrderStatusHistory;
import com.exe101.backend.model.PurchaseOrder;
import com.exe101.backend.model.ReturnRequest;
import com.exe101.backend.model.ReturnRequestStatus;
import com.exe101.backend.model.UserAccount;
import com.exe101.backend.model.WalletTransaction;
import com.exe101.backend.model.WalletTransactionType;
import com.exe101.backend.repository.OrderStatusHistoryRepository;
import com.exe101.backend.repository.PurchaseOrderRepository;
import com.exe101.backend.repository.ReturnRequestRepository;
import com.exe101.backend.repository.UserAccountRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class RefundService {
    private final ReturnRequestRepository returnRequests;
    private final PurchaseOrderRepository orders;
    private final UserAccountRepository users;
    private final OrderStatusHistoryRepository histories;
    private final CurrentUser currentUser;
    private final EntityManager entityManager;
    private final NotificationService notifications;

    public RefundService(ReturnRequestRepository returnRequests,
                         PurchaseOrderRepository orders,
                         UserAccountRepository users,
                         OrderStatusHistoryRepository histories,
                         CurrentUser currentUser,
                         EntityManager entityManager,
                         NotificationService notifications) {
        this.returnRequests = returnRequests;
        this.orders = orders;
        this.users = users;
        this.histories = histories;
        this.currentUser = currentUser;
        this.entityManager = entityManager;
        this.notifications = notifications;
    }

    @Transactional
    public RefundView approve(Long requestId, BigDecimal amountVnd, String note) {
        validateAmount(amountVnd);
        ReturnRequest request = returnRequests.lockById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy yêu cầu hoàn tiền"));
        PurchaseOrder order = orders.lockById(request.getOrder().getId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng"));

        if (request.getStatus() == ReturnRequestStatus.COMPLETED) {
            if (request.getApprovedAmountVnd() == null || request.getApprovedAmountVnd().compareTo(amountVnd) != 0) {
                throw new IllegalStateException("Yêu cầu đã được hoàn với số tiền khác");
            }
            return toView(request, order, request.getCustomer());
        }
        if (request.getStatus() == ReturnRequestStatus.REJECTED) {
            throw new IllegalStateException("Yêu cầu hoàn tiền đã bị từ chối");
        }
        if (amountVnd.compareTo(request.getRequestedAmountVnd()) > 0) {
            throw new IllegalArgumentException("Số tiền duyệt vượt số tiền khách yêu cầu");
        }

        BigDecimal remaining = order.getPaidAmountVnd().subtract(order.getRefundedAmountVnd());
        if (amountVnd.compareTo(remaining) > 0) {
            throw new IllegalArgumentException("Số tiền duyệt vượt số tiền còn có thể hoàn");
        }

        UserAccount customer = users.lockById(request.getCustomer().getId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng"));
        UserAccount admin = currentUser.get();
        String reference = "REFUND:" + requestId;
        Long existing = entityManager.createQuery(
                        "select count(t) from WalletTransaction t where t.reference=:reference", Long.class)
                .setParameter("reference", reference)
                .getSingleResult();
        if (existing > 0) {
            throw new IllegalStateException("Giao dịch hoàn tiền đã tồn tại nhưng yêu cầu chưa hoàn tất; cần kiểm tra dữ liệu");
        }

        BigDecimal before = customer.getWalletBalance() == null ? BigDecimal.ZERO : customer.getWalletBalance();
        customer.creditWallet(amountVnd);
        BigDecimal after = customer.getWalletBalance();
        entityManager.persist(new WalletTransaction(
                customer,
                WalletTransactionType.REFUND,
                amountVnd,
                "Hoàn tiền đơn " + order.getOrderCode(),
                reference,
                order,
                before,
                after
        ));
        order.addRefundedAmount(amountVnd);
        request.completeRefund(amountVnd, note, admin, reference);

        OrderStatus nextStatus = order.getRefundedAmountVnd().compareTo(order.getPaidAmountVnd()) == 0
                ? OrderStatus.REFUNDED
                : previousStatus(request);
        order.changeStatus(nextStatus);
        histories.save(new OrderStatusHistory(
                order,
                nextStatus,
                null,
                "Đã hoàn " + amountVnd.toPlainString() + " VND vào Ví Yufiz. " + note
        ));
        notifications.create(customer, com.exe101.backend.model.NotificationType.REFUND,
                "Hoàn tiền thành công", "Yufiz đã hoàn "+amountVnd.toPlainString()+" VND cho đơn "+order.getOrderCode()+" vào ví của bạn.",
                "/wallet", "REFUND:"+requestId+":COMPLETED");
        return toView(request, order, customer);
    }

    @Transactional
    public RefundView reject(Long requestId, String note) {
        ReturnRequest request = returnRequests.lockById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy yêu cầu hoàn tiền"));
        PurchaseOrder order = orders.lockById(request.getOrder().getId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng"));
        if (request.getStatus() == ReturnRequestStatus.COMPLETED) {
            throw new IllegalStateException("Yêu cầu đã được hoàn tiền");
        }
        if (request.getStatus() != ReturnRequestStatus.REJECTED) {
            request.reject(note, currentUser.get());
            OrderStatus nextStatus = previousStatus(request);
            order.changeStatus(nextStatus);
            histories.save(new OrderStatusHistory(order, nextStatus, null, "Từ chối yêu cầu hoàn tiền. " + note));
            notifications.create(request.getCustomer(), com.exe101.backend.model.NotificationType.REFUND,
                    "Yêu cầu hoàn tiền bị từ chối", "Yêu cầu hoàn tiền cho đơn "+order.getOrderCode()+" chưa được chấp nhận. "+note,
                    "/orders/"+order.getId(), "REFUND:"+requestId+":REJECTED");
        }
        return toView(request, order, request.getCustomer());
    }

    private void validateAmount(BigDecimal amountVnd) {
        if (amountVnd == null || amountVnd.signum() <= 0 || amountVnd.stripTrailingZeros().scale() > 0) {
            throw new IllegalArgumentException("Số tiền hoàn phải là số nguyên VND lớn hơn 0");
        }
    }

    private OrderStatus previousStatus(ReturnRequest request) {
        return request.getPreviousOrderStatus() == null ? OrderStatus.COMPLETED : request.getPreviousOrderStatus();
    }

    private RefundView toView(ReturnRequest request, PurchaseOrder order, UserAccount customer) {
        return new RefundView(
                request.getId(),
                order.getId(),
                order.getOrderCode(),
                customer.getEmail(),
                request.getStatus(),
                request.getRequestedAmountVnd(),
                request.getApprovedAmountVnd(),
                order.getPaidAmountVnd(),
                order.getRefundedAmountVnd(),
                customer.getWalletBalance(),
                request.getAdminNote(),
                request.getReviewedAt()
        );
    }

    public record RefundView(
            Long id,
            Long orderId,
            String orderCode,
            String customerEmail,
            ReturnRequestStatus status,
            BigDecimal requestedAmountVnd,
            BigDecimal approvedAmountVnd,
            BigDecimal paidAmountVnd,
            BigDecimal refundedAmountVnd,
            BigDecimal walletBalance,
            String adminNote,
            LocalDateTime reviewedAt
    ) {}
}
