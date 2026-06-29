package com.exe101.backend.service;

import com.exe101.backend.dto.FinalPaymentRequest;
import com.exe101.backend.dto.InspectionMediaCreateRequest;
import com.exe101.backend.dto.InspectionMediaResponse;
import com.exe101.backend.dto.OrderDetailResponse;
import com.exe101.backend.dto.OrderSummaryResponse;
import com.exe101.backend.dto.OrderTimelineItemResponse;
import com.exe101.backend.dto.PaymentTransactionResponse;
import com.exe101.backend.dto.ReturnRequestCreateRequest;
import com.exe101.backend.dto.ReturnRequestResponse;
import com.exe101.backend.dto.VietnamWarehouseConfirmationRequest;
import com.exe101.backend.dto.DepositPaymentRequest;
import com.exe101.backend.dto.CreateOrderRequest;
import com.exe101.backend.dto.CreateOrderResponse;
import com.exe101.backend.model.UserAccount;
import com.exe101.backend.model.ProductQuote;
import com.exe101.backend.model.InspectionMedia;
import com.exe101.backend.model.OrderStatus;
import com.exe101.backend.model.OrderStatusHistory;
import com.exe101.backend.model.PaymentStatus;
import com.exe101.backend.model.PaymentTransaction;
import com.exe101.backend.model.PaymentType;
import com.exe101.backend.model.PurchaseOrder;
import com.exe101.backend.model.ReturnRequest;
import com.exe101.backend.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
public class OrderService {

    private static final List<OrderStatus> TRACKING_STAGES = List.of(
            OrderStatus.DEPOSIT_PAID,
            OrderStatus.PURCHASED,
            OrderStatus.SHOP_SHIPPING,
            OrderStatus.CHINA_WAREHOUSE,
            OrderStatus.INTERNATIONAL_SHIPPING,
            OrderStatus.VIETNAM_WAREHOUSE,
            OrderStatus.WAITING_FINAL_PAYMENT,
            OrderStatus.FINAL_PAID,
            OrderStatus.DELIVERING,
            OrderStatus.COMPLETED
    );

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final InspectionMediaRepository inspectionMediaRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final ReturnRequestRepository returnRequestRepository;
    private final ProductQuoteRepository productQuoteRepository;
    private final UserAccountRepository userAccountRepository;

    public OrderService(
            PurchaseOrderRepository purchaseOrderRepository,
            OrderStatusHistoryRepository orderStatusHistoryRepository,
            InspectionMediaRepository inspectionMediaRepository,
            PaymentTransactionRepository paymentTransactionRepository,
            ReturnRequestRepository returnRequestRepository,
            UserAccountRepository userAccountRepository,
            ProductQuoteRepository productQuoteRepository
    ) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.orderStatusHistoryRepository = orderStatusHistoryRepository;
        this.inspectionMediaRepository = inspectionMediaRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.returnRequestRepository = returnRequestRepository;
        this.userAccountRepository = userAccountRepository;
        this.productQuoteRepository = productQuoteRepository;
    }

    @Transactional(readOnly = true)
    public List<OrderSummaryResponse> getOrderHistory(Long customerId) {
        return purchaseOrderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(this::toSummaryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderDetailResponse getOrderDetail(Long orderId, Long customerId) {
        PurchaseOrder order = findCustomerOrder(orderId, customerId);
        List<OrderStatusHistory> histories = orderStatusHistoryRepository.findByOrderIdOrderByCreatedAtAsc(orderId);
        List<InspectionMedia> inspectionMedia = inspectionMediaRepository.findByOrderIdOrderByCreatedAtAsc(orderId);
        List<ReturnRequest> returnRequests = returnRequestRepository.findByOrderIdOrderByCreatedAtDesc(orderId);
        return toDetailResponse(order, histories, inspectionMedia, returnRequests);
    }

    @Transactional
    public OrderDetailResponse confirmVietnamWarehouse(
            Long orderId,
            VietnamWarehouseConfirmationRequest request
    ) {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
        if (order.getStatus() == OrderStatus.CANCELLED
                || order.getStatus() == OrderStatus.RETURN_REQUESTED
                || order.getStatus() == OrderStatus.REFUNDED) {
            throw new IllegalStateException("Order cannot be confirmed at Vietnam warehouse");
        }

        order.changeStatus(OrderStatus.WAITING_FINAL_PAYMENT);
        orderStatusHistoryRepository.save(new OrderStatusHistory(
                order,
                OrderStatus.VIETNAM_WAREHOUSE,
                request.location() == null ? "Kho VN" : request.location(),
                request.note() == null ? "Hang da ve kho VN" : request.note()
        ));
        orderStatusHistoryRepository.save(new OrderStatusHistory(
                order,
                OrderStatus.WAITING_FINAL_PAYMENT,
                request.location() == null ? "Kho VN" : request.location(),
                "Cho khach hang thanh toan 30% con lai"
        ));

        if (request.inspectionMedia() != null) {
            request.inspectionMedia().stream()
                    .map(media -> toInspectionMedia(order, media))
                    .forEach(inspectionMediaRepository::save);
        }

        List<OrderStatusHistory> histories = orderStatusHistoryRepository.findByOrderIdOrderByCreatedAtAsc(orderId);
        List<InspectionMedia> inspectionMedia = inspectionMediaRepository.findByOrderIdOrderByCreatedAtAsc(orderId);
        List<ReturnRequest> returnRequests = returnRequestRepository.findByOrderIdOrderByCreatedAtDesc(orderId);
        return toDetailResponse(order, histories, inspectionMedia, returnRequests);
    }

    @Transactional
    public PaymentTransactionResponse payFinalAmount(Long orderId, FinalPaymentRequest request) {
        PurchaseOrder order = findCustomerOrder(orderId, request.customerId());
        if (order.getStatus() != OrderStatus.VIETNAM_WAREHOUSE
                && order.getStatus() != OrderStatus.WAITING_FINAL_PAYMENT) {
            throw new IllegalStateException("Order is not ready for final payment");
        }

        paymentTransactionRepository.findFirstByOrderIdAndTypeOrderByCreatedAtDesc(orderId, PaymentType.FINAL_30)
                .filter(transaction -> transaction.getStatus() == PaymentStatus.PAID)
                .ifPresent(transaction -> {
                    throw new IllegalStateException("Final payment has already been paid");
                });

        LocalDateTime now = LocalDateTime.now();
        PaymentTransaction payment = paymentTransactionRepository.save(new PaymentTransaction(
                order,
                order.getCustomer(),
                PaymentType.FINAL_30,
                request.paymentMethod(),
                PaymentStatus.PAID,
                order.getFinalAmountVnd(),
                request.providerTransactionCode(),
                now
        ));

        order.addPaidAmount(order.getFinalAmountVnd());
        order.changeStatus(OrderStatus.FINAL_PAID);
        orderStatusHistoryRepository.save(new OrderStatusHistory(
                order,
                OrderStatus.FINAL_PAID,
                "Kho VN",
                "Khach hang da thanh toan 30% con lai"
        ));

        return toPaymentResponse(payment);
    }

    @Transactional
    public ReturnRequestResponse createReturnRequest(Long orderId, ReturnRequestCreateRequest request) {
        PurchaseOrder order = findCustomerOrder(orderId, request.customerId());
        if (order.getStatus() != OrderStatus.COMPLETED
                && order.getStatus() != OrderStatus.DELIVERING
                && order.getStatus() != OrderStatus.FINAL_PAID) {
            throw new IllegalStateException("Order is not eligible for return request");
        }

        ReturnRequest returnRequest = returnRequestRepository.save(new ReturnRequest(
                order,
                order.getCustomer(),
                request.reason(),
                request.evidenceUrl()
        ));

        order.changeStatus(OrderStatus.RETURN_REQUESTED);
        orderStatusHistoryRepository.save(new OrderStatusHistory(
                order,
                OrderStatus.RETURN_REQUESTED,
                null,
                "Khach hang da gui yeu cau doi/tra hang"
        ));

        return toReturnRequestResponse(returnRequest);
    }

    private PurchaseOrder findCustomerOrder(Long orderId, Long customerId) {
        return purchaseOrderRepository.findByIdAndCustomerId(orderId, customerId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
    }

    private OrderSummaryResponse toSummaryResponse(PurchaseOrder order) {
        return new OrderSummaryResponse(
                order.getId(),
                order.getOrderCode(),
                order.getStatus(),
                order.getQuantity(),
                order.getTotalAmountVnd(),
                order.getPaidAmountVnd(),
                order.getFinalAmountVnd(),
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }

    private OrderDetailResponse toDetailResponse(
            PurchaseOrder order,
            List<OrderStatusHistory> histories,
            List<InspectionMedia> inspectionMedia,
            List<ReturnRequest> returnRequests
    ) {
        return new OrderDetailResponse(
                order.getId(),
                order.getOrderCode(),
                order.getStatus(),
                order.getQuantity(),
                order.getTotalAmountVnd(),
                order.getDepositAmountVnd(),
                order.getFinalAmountVnd(),
                order.getPaidAmountVnd(),
                order.getShippingAddress(),
                order.getCustomerNote(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                buildTimeline(order, histories),
                inspectionMedia.stream().map(this::toInspectionMediaResponse).toList(),
                returnRequests.stream().map(this::toReturnRequestResponse).toList()
        );
    }

    private List<OrderTimelineItemResponse> buildTimeline(
            PurchaseOrder order,
            List<OrderStatusHistory> histories
    ) {
        Map<OrderStatus, OrderStatusHistory> historyByStatus = new EnumMap<>(OrderStatus.class);
        for (OrderStatusHistory history : histories) {
            historyByStatus.put(history.getStatus(), history);
        }

        int currentStageIndex = TRACKING_STAGES.indexOf(order.getStatus());
        return TRACKING_STAGES.stream()
                .map(status -> {
                    OrderStatusHistory history = historyByStatus.get(status);
                    boolean reached = history != null
                            || (currentStageIndex >= 0 && TRACKING_STAGES.indexOf(status) <= currentStageIndex);
                    return new OrderTimelineItemResponse(
                            status,
                            labelFor(status),
                            reached,
                            history == null ? null : history.getLocation(),
                            history == null ? null : history.getNote(),
                            history == null ? null : history.getCreatedAt()
                    );
                })
                .toList();
    }

    private String labelFor(OrderStatus status) {
        return switch (status) {
            case DEPOSIT_PAID -> "Da dat";
            case PURCHASED -> "Shubop da mua hang";
            case SHOP_SHIPPING -> "Shop ship";
            case CHINA_WAREHOUSE -> "Kho TQ";
            case INTERNATIONAL_SHIPPING -> "Van chuyen quoc te";
            case VIETNAM_WAREHOUSE -> "Kho VN";
            case WAITING_FINAL_PAYMENT -> "Cho thanh toan 30% con lai";
            case FINAL_PAID -> "Da thanh toan 30% con lai";
            case DELIVERING -> "Giao khach";
            case COMPLETED -> "Hoan thanh";
            default -> status.name();
        };
    }

    private InspectionMediaResponse toInspectionMediaResponse(InspectionMedia media) {
        return new InspectionMediaResponse(
                media.getId(),
                media.getMediaType(),
                media.getMediaUrl(),
                media.getNote(),
                media.getCreatedAt()
        );
    }

    private InspectionMedia toInspectionMedia(PurchaseOrder order, InspectionMediaCreateRequest request) {
        return new InspectionMedia(
                order,
                request.mediaType(),
                request.mediaUrl(),
                request.note()
        );
    }

    private ReturnRequestResponse toReturnRequestResponse(ReturnRequest request) {
        return new ReturnRequestResponse(
                request.getId(),
                request.getReason(),
                request.getEvidenceUrl(),
                request.getStatus(),
                request.getAdminNote(),
                request.getCreatedAt()
        );
    }

    private PaymentTransactionResponse toPaymentResponse(PaymentTransaction payment) {
        return new PaymentTransactionResponse(
                payment.getId(),
                payment.getOrder().getId(),
                payment.getType(),
                payment.getMethod(),
                payment.getStatus(),
                payment.getAmountVnd(),
                payment.getProviderTransactionCode(),
                payment.getPaidAt()
        );
    }
    @Transactional
    public CreateOrderResponse createOrder(CreateOrderRequest request) {
        UserAccount customer = userAccountRepository.findById(request.customerId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        ProductQuote quote = productQuoteRepository.findById(request.productQuoteId())
                .orElseThrow(() -> new EntityNotFoundException("Product quote not found"));

        // Tính tiền
        BigDecimal unitPrice = quote.getEstimatedTotalVnd();
        BigDecimal total = unitPrice.multiply(BigDecimal.valueOf(request.quantity()));
        BigDecimal deposit = total.multiply(new BigDecimal("0.7"))
                .setScale(0, RoundingMode.HALF_UP);
        BigDecimal finalAmt = total.subtract(deposit);

        String orderCode = "YFZ" + System.currentTimeMillis();
        String address = request.shippingAddress() != null
                ? request.shippingAddress()
                : customer.getDefaultShippingAddress();

        PurchaseOrder order = new PurchaseOrder(
                orderCode,
                customer,
                request.quantity(),
                total,
                deposit,
                finalAmt,
                address,
                request.customerNote()
        );
        order.setProductQuote(quote);
        purchaseOrderRepository.save(order);

        orderStatusHistoryRepository.save(new OrderStatusHistory(
                order,
                OrderStatus.WAITING_DEPOSIT,
                null,
                "Don hang vua duoc tao, cho khach hang dat coc 70%"
        ));

        return new CreateOrderResponse(
                order.getId(),
                order.getOrderCode(),
                order.getStatus(),
                order.getQuantity(),
                // Thông tin sản phẩm
                quote.getTranslatedName() != null ? quote.getTranslatedName() : quote.getOriginalName(),
                quote.getImageUrl(),
                request.variantSelected(),
                // Địa chỉ
                order.getShippingAddress(),
                order.getCustomerNote(),
                // Chi phí
                quote.getProductPriceCny(),
                quote.getDomesticShippingFeeCny(),
                quote.getServiceFeeVnd(),
                quote.getInternationalShippingFeeVnd(),
                quote.getExchangeRate(),
                // Tổng
                order.getTotalAmountVnd(),
                order.getDepositAmountVnd(),
                order.getFinalAmountVnd(),
                order.getCreatedAt()
        );
    }

    @Transactional
    public PaymentTransactionResponse payDeposit(Long orderId, DepositPaymentRequest request) {
        PurchaseOrder order = findCustomerOrder(orderId, request.customerId());

        if (order.getStatus() != OrderStatus.WAITING_DEPOSIT) {
            throw new IllegalStateException("Order is not waiting for deposit");
        }

        // Kiểm tra đã đặt cọc chưa
        paymentTransactionRepository
                .findFirstByOrderIdAndTypeOrderByCreatedAtDesc(orderId, PaymentType.DEPOSIT_70)
                .filter(t -> t.getStatus() == PaymentStatus.PAID)
                .ifPresent(t -> { throw new IllegalStateException("Deposit already paid"); });

        LocalDateTime now = LocalDateTime.now();
        PaymentTransaction payment = paymentTransactionRepository.save(new PaymentTransaction(
                order,
                order.getCustomer(),
                PaymentType.DEPOSIT_70,
                request.paymentMethod(),
                PaymentStatus.PAID,
                order.getDepositAmountVnd(),
                request.providerTransactionCode(),
                now
        ));

        order.addPaidAmount(order.getDepositAmountVnd());
        order.changeStatus(OrderStatus.DEPOSIT_PAID);
        orderStatusHistoryRepository.save(new OrderStatusHistory(
                order,
                OrderStatus.DEPOSIT_PAID,
                null,
                "Khach hang da dat coc 70%"
        ));

        return toPaymentResponse(payment);
    }
}
