package com.exe101.backend.service;

import com.exe101.backend.dto.CreateOrderRequest;
import com.exe101.backend.dto.CreateOrderResponse;
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
import com.exe101.backend.model.FeeConfig;
import com.exe101.backend.model.InspectionMedia;
import com.exe101.backend.model.OrderStatus;
import com.exe101.backend.model.OrderStatusHistory;
import com.exe101.backend.model.PaymentStatus;
import com.exe101.backend.model.PaymentTransaction;
import com.exe101.backend.model.PaymentType;
import com.exe101.backend.model.ProductQuote;
import com.exe101.backend.model.PurchaseOrder;
import com.exe101.backend.model.ReturnRequest;
import com.exe101.backend.model.UserAccount;
import com.exe101.backend.repository.InspectionMediaRepository;
import com.exe101.backend.repository.OrderStatusHistoryRepository;
import com.exe101.backend.repository.PaymentTransactionRepository;
import com.exe101.backend.repository.ProductQuoteRepository;
import com.exe101.backend.repository.PurchaseOrderRepository;
import com.exe101.backend.repository.ReturnRequestRepository;
import com.exe101.backend.repository.UserAccountRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
    private final FeeConfigService feeConfigService;
    private final PricingService pricing;
    private final CurrentUser currentUser;
    private final NotificationService notifications;

    public OrderService(
            PurchaseOrderRepository purchaseOrderRepository,
            OrderStatusHistoryRepository orderStatusHistoryRepository,
            InspectionMediaRepository inspectionMediaRepository,
            PaymentTransactionRepository paymentTransactionRepository,
            ReturnRequestRepository returnRequestRepository,
            ProductQuoteRepository productQuoteRepository,
            UserAccountRepository userAccountRepository,
            FeeConfigService feeConfigService,
            PricingService pricing, CurrentUser currentUser, NotificationService notifications
    ) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.orderStatusHistoryRepository = orderStatusHistoryRepository;
        this.inspectionMediaRepository = inspectionMediaRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.returnRequestRepository = returnRequestRepository;
        this.productQuoteRepository = productQuoteRepository;
        this.userAccountRepository = userAccountRepository;
        this.feeConfigService = feeConfigService;
        this.pricing = pricing; this.currentUser = currentUser; this.notifications = notifications;
    }

    @Transactional(readOnly = true)
    public List<OrderSummaryResponse> getOrderHistory(Long customerId) {
        currentUser.requireId(customerId);
        return purchaseOrderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(this::toSummaryResponse)
                .toList();
    }

    @Transactional
    public CreateOrderResponse createOrder(CreateOrderRequest request) {
        currentUser.requireId(request.customerId());
        // Fetch ProductQuote
        ProductQuote quote = productQuoteRepository.findById(request.productQuoteId())
                .orElseThrow(() -> new EntityNotFoundException("ProductQuote not found with id: " + request.productQuoteId()));

        // Fetch Customer
        UserAccount customer = userAccountRepository.lockById(request.customerId())
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with id: " + request.customerId()));

        var previous = purchaseOrderRepository.findByCustomerIdAndRequestKey(customer.getId(), request.requestKey());
        if (previous.isPresent()) {
            PurchaseOrder existing = previous.get();
            if (!existing.getQuantity().equals(request.quantity()) || !existing.getShippingAddress().equals(request.shippingAddress())
                    || !existing.getProductQuote().getId().equals(request.productQuoteId())
                    || !java.util.Objects.equals(existing.getVariantSelected(), request.variantSelected())
                    || !java.util.Objects.equals(existing.getCustomerNote(), request.customerNote()))
                throw new IllegalStateException("Yêu cầu đã tạo một đơn với thông tin khác. Vui lòng kiểm tra danh sách đơn.");
            try { return createdResponse(existing, new com.fasterxml.jackson.databind.ObjectMapper().readValue(existing.getCostSnapshotJson(), com.exe101.backend.dto.PricePreviewResponse.class)); }
            catch (com.fasterxml.jackson.core.JsonProcessingException e) { throw new IllegalStateException("Không đọc được bảng giá"); }
        }
        if (quote.getExpiresAt() == null || quote.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Báo giá đã hết hạn. Vui lòng phân tích lại link trước khi đặt.");
        }
        // Get Fee Config
        FeeConfig feeConfig = feeConfigService.getConfig();

        // Generate unique order code
        String orderCode = generateOrderCode();

        if (!quote.getVariants().isEmpty() && (request.variantSelected() == null || request.variantSelected().isBlank()))
            throw new IllegalArgumentException("Vui lòng chọn phân loại sản phẩm");
        var price = pricing.calculate(quote, request.quantity(), request.variantSelected());
        if (price.grandTotalVnd().compareTo(request.expectedTotalVnd()) != 0)
            throw new IllegalStateException("Báo giá đã thay đổi. Vui lòng tải lại và xác nhận số tiền mới.");
        BigDecimal productPriceCny = price.productPriceCny();
        BigDecimal domesticShippingFeeCny = price.domesticShippingFeeCny();
        BigDecimal serviceFeeVnd = price.serviceFeeVnd();
        BigDecimal internationalShippingFeeVnd = price.internationalShippingFeeVnd();
        BigDecimal exchangeRate = price.exchangeRate();
        BigDecimal totalAmountVnd = price.grandTotalVnd();
        BigDecimal depositAmountVnd = price.depositAmountVnd();
        BigDecimal finalAmountVnd = price.finalAmountVnd();

        // Create order
        PurchaseOrder order = new PurchaseOrder(
                orderCode,
                customer,
                request.quantity(),
                totalAmountVnd,
                depositAmountVnd,
                finalAmountVnd,
                request.shippingAddress(),
                request.customerNote()
        );

        order.setRequestKey(request.requestKey());
        order.setProductSnapshot(quote, request.variantSelected());
        order.setCostSnapshot(price);
        PurchaseOrder savedOrder = purchaseOrderRepository.save(order);

        // Create initial order status history
        orderStatusHistoryRepository.save(new OrderStatusHistory(
                savedOrder,
                OrderStatus.WAITING_DEPOSIT,
                "Hệ thống",
                "Đơn hàng được tạo, chờ thanh toán đặt cọc 70%"
        ));

        return createdResponse(savedOrder, price);
    }

    private CreateOrderResponse createdResponse(PurchaseOrder order, com.exe101.backend.dto.PricePreviewResponse price) {
        return new CreateOrderResponse(order.getId(), order.getOrderCode(), order.getStatus(), order.getQuantity(),
                order.getProductName(), order.getProductImageUrl(), order.getVariantSelected(), order.getShippingAddress(), order.getCustomerNote(),
                price.productPriceCny(), price.domesticShippingFeeCny(), price.serviceFeeVnd(), price.internationalShippingFeeVnd(), price.exchangeRate(),
                order.getTotalAmountVnd(), order.getDepositAmountVnd(), order.getFinalAmountVnd(), order.getCreatedAt());
    }

    private String generateOrderCode() {
        return "ORD" + java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 20).toUpperCase();
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
        PurchaseOrder order = purchaseOrderRepository.lockById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
        if (order.getStatus() != OrderStatus.INTERNATIONAL_SHIPPING) {
            throw new IllegalStateException("Order cannot be confirmed at Vietnam warehouse");
        }
        if(order.getPaidAmountVnd().compareTo(order.getDepositAmountVnd())<0) throw new IllegalStateException("Đơn chưa nhận đủ cọc");

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

    @Transactional(readOnly=true)
    public OrderDetailResponse adminDetail(Long id) {
        PurchaseOrder order=purchaseOrderRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn"));
        return toDetailResponse(order,orderStatusHistoryRepository.findByOrderIdOrderByCreatedAtAsc(id),
                inspectionMediaRepository.findByOrderIdOrderByCreatedAtAsc(id),returnRequestRepository.findByOrderIdOrderByCreatedAtDesc(id));
    }
    @Transactional
    public OrderDetailResponse cancelUnpaid(Long id) {
        var order=purchaseOrderRepository.lockById(id).orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn"));
        currentUser.requireId(order.getCustomer().getId());
        if(order.getStatus()==OrderStatus.CANCELLED) return adminDetail(id);
        if(order.getStatus()!=OrderStatus.WAITING_DEPOSIT || order.getPaidAmountVnd().signum()!=0
                || paymentTransactionRepository.existsByOrderIdAndStatusIn(id,List.of(PaymentStatus.PENDING,PaymentStatus.PAID,PaymentStatus.REVIEW)))
            throw new IllegalStateException("Đơn đã có yêu cầu thanh toán hoặc đang xử lý. Vui lòng liên hệ hỗ trợ để kiểm tra trước khi hủy.");
        order.changeStatus(OrderStatus.CANCELLED);
        orderStatusHistoryRepository.save(new OrderStatusHistory(order,OrderStatus.CANCELLED,null,"Khách hủy trước khi tạo thanh toán"));
        return adminDetail(id);
    }

    @Transactional(readOnly=true)
    public org.springframework.data.domain.Page<OrderSummaryResponse> adminList(int page) {
        return purchaseOrderRepository.findAll(org.springframework.data.domain.PageRequest.of(page,20,
                org.springframework.data.domain.Sort.by("createdAt").descending())).map(this::toSummaryResponse);
    }

    @Transactional
    public OrderDetailResponse advance(Long id, OrderStatus expected, OrderStatus next, String location, String note) {
        PurchaseOrder order=purchaseOrderRepository.lockById(id).orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn"));
        if(order.getStatus()!=expected) throw new IllegalStateException("Trạng thái đã thay đổi. Vui lòng tải lại đơn.");
        OrderStatus allowed=switch(expected) {
            case DEPOSIT_PAID -> OrderStatus.PURCHASED;
            case PURCHASED -> OrderStatus.SHOP_SHIPPING;
            case SHOP_SHIPPING -> OrderStatus.CHINA_WAREHOUSE;
            case CHINA_WAREHOUSE -> OrderStatus.INTERNATIONAL_SHIPPING;
            case INTERNATIONAL_SHIPPING -> OrderStatus.WAITING_FINAL_PAYMENT;
            case FINAL_PAID -> OrderStatus.DELIVERING;
            case DELIVERING -> OrderStatus.COMPLETED;
            default -> null;
        };
        if(next!=allowed) throw new IllegalStateException("Không được bỏ qua bước xử lý hoặc tự xác nhận thanh toán");
        if(order.getPaidAmountVnd().compareTo(order.getDepositAmountVnd())<0
                || ((next==OrderStatus.DELIVERING || next==OrderStatus.COMPLETED) && order.getPaidAmountVnd().compareTo(order.getTotalAmountVnd())<0))
            throw new IllegalStateException("Đơn chưa nhận đủ tiền để chuyển bước");
        if(expected==OrderStatus.INTERNATIONAL_SHIPPING)
            orderStatusHistoryRepository.save(new OrderStatusHistory(order,OrderStatus.VIETNAM_WAREHOUSE,location,note));
        order.changeStatus(next);
        orderStatusHistoryRepository.save(new OrderStatusHistory(order,next,location,note));
        notifications.create(order.getCustomer(),com.exe101.backend.model.NotificationType.ORDER_STATUS,
                "Đơn hàng đã cập nhật", "Đơn "+order.getOrderCode()+" chuyển sang trạng thái "+next+".",
                "/orders/"+order.getId(),"ORDER:"+order.getId()+":"+next);
        return adminDetail(id);
    }

    @Transactional
    public ReturnRequestResponse createReturnRequest(Long orderId, ReturnRequestCreateRequest request) {
        currentUser.requireId(request.customerId());
        PurchaseOrder order = purchaseOrderRepository.lockById(orderId).orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn"));
        currentUser.requireId(order.getCustomer().getId());
        if (order.getStatus() != OrderStatus.COMPLETED
                && order.getStatus() != OrderStatus.DELIVERING
                && order.getStatus() != OrderStatus.FINAL_PAID) {
            throw new IllegalStateException("Đơn hiện không đủ điều kiện yêu cầu hoàn tiền");
        }
        if(returnRequestRepository.existsByOrderIdAndStatusIn(orderId,List.of(com.exe101.backend.model.ReturnRequestStatus.REQUESTED,
                com.exe101.backend.model.ReturnRequestStatus.REVIEWING,com.exe101.backend.model.ReturnRequestStatus.APPROVED)))
            throw new IllegalStateException("Đơn đang có yêu cầu hoàn tiền chưa xử lý");
        BigDecimal refundable=order.getPaidAmountVnd().subtract(order.getRefundedAmountVnd());
        BigDecimal requested=request.requestedAmountVnd()==null?refundable:request.requestedAmountVnd();
        if(requested.signum()<=0||requested.stripTrailingZeros().scale()>0||requested.compareTo(refundable)>0)
            throw new IllegalArgumentException("Số tiền yêu cầu hoàn không hợp lệ");

        ReturnRequest returnRequest = returnRequestRepository.save(new ReturnRequest(
                order,
                order.getCustomer(),
                request.reason(),
                request.evidenceUrl(),
                requested
        ));

        order.changeStatus(OrderStatus.RETURN_REQUESTED);
        orderStatusHistoryRepository.save(new OrderStatusHistory(
                order,
                OrderStatus.RETURN_REQUESTED,
                null,
                "Khach hang da gui yeu cau doi/tra hang"
        ));
        notifications.create(order.getCustomer(),com.exe101.backend.model.NotificationType.REFUND,
                "Đã nhận yêu cầu hoàn tiền", "Yufiz đã nhận yêu cầu hoàn "+requested.toPlainString()+" VND cho đơn "+order.getOrderCode()+".",
                "/orders/"+order.getId(),"REFUND:"+returnRequest.getId()+":REQUESTED");

        return toReturnRequestResponse(returnRequest);
    }

    private PurchaseOrder findCustomerOrder(Long orderId, Long customerId) {
        currentUser.requireId(customerId);
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
                order.getRefundedAmountVnd(),
                order.getShippingAddress(),
                order.getCustomerNote(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                buildTimeline(order, histories),
                inspectionMedia.stream().map(this::toInspectionMediaResponse).toList(),
                returnRequests.stream().map(this::toReturnRequestResponse).toList(),
                order.getProductName(), order.getProductImageUrl(), order.getSourceUrl(), order.getVariantSelected(),
                order.getCostSnapshotJson()
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
                request.getRequestedAmountVnd(),
                request.getApprovedAmountVnd(),
                request.getReviewedAt(),
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
}
