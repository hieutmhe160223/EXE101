package com.exe101.backend.service;
import com.exe101.backend.dto.*;
import com.exe101.backend.model.*;
import com.exe101.backend.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class DepositPaymentService {
    private final PurchaseOrderRepository orders;
    private final PaymentTransactionRepository payments;
    private final OrderStatusHistoryRepository histories;
    private final UserAccountRepository users;
    private final PaymentGateway gateway;
    private final CurrentUser user;
    private final ObjectMapper mapper;
    private final NotificationService notifications;
    @jakarta.persistence.PersistenceContext private jakarta.persistence.EntityManager entityManager;
    public DepositPaymentService(PurchaseOrderRepository orders, PaymentTransactionRepository payments,
            OrderStatusHistoryRepository histories, UserAccountRepository users, PaymentGateway gateway, CurrentUser user, ObjectMapper mapper,
            NotificationService notifications) {
        this.orders=orders; this.payments=payments; this.histories=histories; this.users=users; this.gateway=gateway; this.user=user; this.mapper=mapper; this.notifications=notifications;
    }
    public record PaymentView(Long id, Long orderId, String orderCode, PaymentType type, PaymentMethod method, PaymentStatus status,
            BigDecimal amountVnd, String merchantReference, PaymentGateway.Instructions instructions, String message) {}
    @Transactional
    public PaymentView create(Long orderId, PaymentMethod method) {
        return create(orderId, method, PaymentType.DEPOSIT_70);
    }
    @Transactional
    public PaymentView create(Long orderId, PaymentMethod method, PaymentType type) {
        validateType(type);
        PurchaseOrder order=orders.lockById(orderId).orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn"));
        user.requireId(order.getCustomer().getId());
        validatePayable(order,type);
        var previous=payments.findFirstByOrderIdAndTypeOrderByCreatedAtDesc(orderId,type);
        if (previous.isPresent() && previous.get().getStatus()==PaymentStatus.PENDING) {
            if (previous.get().getMethod()!=method) throw new IllegalStateException("Đơn đã có yêu cầu thanh toán đang chờ. Vui lòng hoàn tất phương thức đã chọn.");
            return view(previous.get());
        }
        BigDecimal amount=type==PaymentType.DEPOSIT_70 ? order.getDepositAmountVnd() : order.getTotalAmountVnd().subtract(order.getPaidAmountVnd());
        if(method==PaymentMethod.WALLET) return payFromWallet(order,type,amount);
        if (!gateway.available(method)) throw new IllegalStateException("Phương thức này chưa được cấu hình");
        PaymentTransaction payment=new PaymentTransaction(order,order.getCustomer(),type,method,
                PaymentStatus.PENDING,amount,null,null);
        String ref=LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).format(DateTimeFormatter.ofPattern("yyMMdd"))+"_"+UUID.randomUUID().toString().replace("-","").substring(0,24);
        payment.setMerchantReference(ref);
        payments.saveAndFlush(payment);
        try {
            payment.setInstructionsJson(mapper.writeValueAsString(gateway.create(payment)));
        } catch (PaymentGateway.Declined ex) {
            payment.fail(); payment.setReconciliationNote(ex.getMessage());
        } catch (Exception ex) {
            // Keep the reference: the provider may have accepted the request before a network timeout.
            payment.setReconciliationNote("Chưa nhận được hướng dẫn thanh toán. Đang chờ kiểm tra với nhà cung cấp; vui lòng liên hệ hỗ trợ, không chuyển tiền lần hai.");
        }
        return view(payment);
    }
    private PaymentView payFromWallet(PurchaseOrder order,PaymentType type,BigDecimal amount) {
        if(type!=PaymentType.DEPOSIT_70)throw new IllegalStateException("Ví Yufiz hiện chỉ hỗ trợ thanh toán đặt cọc");
        UserAccount payer=users.lockById(order.getCustomer().getId()).orElseThrow(() -> new EntityNotFoundException("Không tìm thấy tài khoản"));
        BigDecimal balanceBefore=payer.getWalletBalance()==null?BigDecimal.ZERO:payer.getWalletBalance();
        payer.debitWallet(amount);
        PaymentTransaction payment=new PaymentTransaction(order,payer,type,PaymentMethod.WALLET,PaymentStatus.PENDING,amount,null,null);
        String ref="WALLET_"+UUID.randomUUID().toString().replace("-","").substring(0,24);
        payment.setMerchantReference(ref);
        payments.saveAndFlush(payment);
        payment.confirmPaid("WALLET-"+payment.getId()+"-"+UUID.randomUUID().toString().substring(0,8));
        order.addPaidAmount(amount);
        order.changeStatus(OrderStatus.DEPOSIT_PAID);
        entityManager.persist(new WalletTransaction(payer,WalletTransactionType.PAYMENT,amount.negate(),"Đặt cọc đơn "+order.getOrderCode(),
                "PAYMENT:"+payment.getId(),order,balanceBefore,payer.getWalletBalance()));
        histories.save(new OrderStatusHistory(order,OrderStatus.DEPOSIT_PAID,"Thanh toán","Đã thanh toán đặt cọc bằng số dư ví Yufiz"));
        notifications.create(payer,NotificationType.PAYMENT,"Thanh toán đặt cọc thành công",
                "Đơn "+order.getOrderCode()+" đã nhận "+amount.toPlainString()+" VND từ Ví Yufiz.",
                "/orders/"+order.getId(),"PAYMENT:"+payment.getId()+":PAID");
        return view(payment);
    }
    @Transactional(readOnly=true)
    public PaymentView latest(Long orderId) {
        return latest(orderId,PaymentType.DEPOSIT_70);
    }
    @Transactional(readOnly=true)
    public PaymentView latest(Long orderId, PaymentType type) {
        validateType(type);
        PurchaseOrder order=orders.findById(orderId).orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn"));
        user.requireId(order.getCustomer().getId());
        return payments.findFirstByOrderIdAndTypeOrderByCreatedAtDesc(orderId,type).map(this::view).orElse(null);
    }
    @Transactional
    public PaymentView cancel(Long paymentId,String reason) {
        PaymentTransaction found=payments.findById(paymentId).orElseThrow(() -> new EntityNotFoundException("Không tìm thấy giao dịch"));
        PurchaseOrder order=orders.lockById(found.getOrder().getId()).orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn"));
        PaymentTransaction payment=payments.findById(paymentId).orElseThrow();
        entityManager.refresh(payment);
        user.requireId(payment.getPayer().getId());
        if(payment.getStatus()==PaymentStatus.CANCELLED)return view(payment);
        if(payment.getStatus()!=PaymentStatus.PENDING)throw new IllegalStateException("Giao dịch đã được xử lý nên không thể hủy");
        PaymentType type=payment.getType();
        if((type==PaymentType.DEPOSIT_70&&order.getStatus()!=OrderStatus.WAITING_DEPOSIT)
                ||(type==PaymentType.FINAL_30&&order.getStatus()!=OrderStatus.WAITING_FINAL_PAYMENT))
            throw new IllegalStateException("Trạng thái đơn đã thay đổi nên không thể hủy giao dịch");
        String message=reason==null||reason.isBlank()?"Khách hàng hủy yêu cầu thanh toán":reason.trim();
        payment.cancel(message,"CUSTOMER");
        payment.setReconciliationNote("Đã hủy bởi khách hàng: "+message);
        notifications.create(payment.getPayer(),NotificationType.PAYMENT,"Đã hủy yêu cầu thanh toán",
                "Yêu cầu thanh toán cho đơn "+order.getOrderCode()+" đã được hủy. Bạn có thể chọn phương thức khác.",
                "/orders/"+order.getId(),"PAYMENT:"+payment.getId()+":CANCELLED");
        return view(payment);
    }
    @Transactional
    public void settle(PaymentMethod method, PaymentGateway.VerifiedPayment verified) {
        PaymentTransaction reference=payments.findByMerchantReference(verified.reference()).orElseThrow(() -> new EntityNotFoundException("Không tìm thấy giao dịch"));
        PurchaseOrder order=orders.lockById(reference.getOrder().getId()).orElseThrow();
        // Refresh after obtaining the order lock so concurrent callback retries observe the committed payment.
        PaymentTransaction payment=payments.findById(reference.getId()).orElseThrow();
        entityManager.refresh(payment);
        validateType(payment.getType());
        if (payment.getMethod()!=method || payment.getAmountVnd().compareTo(verified.amount())!=0)
            throw new IllegalArgumentException("Phương thức hoặc số tiền không khớp");
        if (payment.getStatus()==PaymentStatus.PAID) {
            if (!Objects.equals(payment.getProviderTransactionCode(),verified.transactionCode())) throw new IllegalStateException("Mã giao dịch không khớp lần xác nhận trước");
            return;
        }
        if(payment.getStatus()==PaymentStatus.REVIEW) {
            if(!Objects.equals(payment.getProviderTransactionCode(),verified.transactionCode()))throw new IllegalStateException("Giao dịch đang đối soát với mã khác");
            return;
        }
        if(payment.getStatus()==PaymentStatus.CANCELLED) {
            if(!verified.paid())return;
            if(verified.transactionCode()==null || verified.transactionCode().isBlank())throw new IllegalArgumentException("Thiếu mã giao dịch");
            if(payments.existsBySettlementKey(method.name()+":"+verified.transactionCode()))throw new IllegalStateException("Giao dịch đã được đối soát cho đơn khác");
            payment.review(verified.transactionCode(),"Đã nhận tiền sau khi yêu cầu thanh toán bị hủy. Cần đối soát thủ công.");
            notifications.create(payment.getPayer(),NotificationType.PAYMENT,"Giao dịch cần đối soát",
                    "Yufiz đã nhận tín hiệu tiền đến cho yêu cầu đã hủy của đơn "+order.getOrderCode()+". Bộ phận hỗ trợ đang kiểm tra.",
                    "/orders/"+order.getId(),"PAYMENT:"+payment.getId()+":REVIEW");
            return;
        }
        if (!verified.paid()) { payment.fail(); return; }
        if (verified.transactionCode()==null || verified.transactionCode().isBlank()) throw new IllegalArgumentException("Thiếu mã giao dịch");
        if (payments.existsBySettlementKey(method.name()+":"+verified.transactionCode())) throw new IllegalStateException("Giao dịch đã được đối soát cho đơn khác");
        if(payment.getStatus()!=PaymentStatus.PENDING)throw new IllegalStateException("Giao dịch không còn chờ thanh toán");
        validatePayable(order,payment.getType());
        BigDecimal expected=payment.getType()==PaymentType.DEPOSIT_70 ? order.getDepositAmountVnd() : order.getTotalAmountVnd().subtract(order.getPaidAmountVnd());
        if (expected.compareTo(payment.getAmountVnd())!=0) throw new IllegalStateException("Số tiền còn phải trả đã thay đổi; cần đối soát");
        payment.confirmPaid(verified.transactionCode());
        OrderStatus next=payment.getType()==PaymentType.DEPOSIT_70 ? OrderStatus.DEPOSIT_PAID : OrderStatus.FINAL_PAID;
        order.addPaidAmount(payment.getAmountVnd()); order.changeStatus(next);
        histories.save(new OrderStatusHistory(order,next,"Thanh toán","Đã xác nhận "+payment.getType()+" qua "+method));
        notifications.create(payment.getPayer(),NotificationType.PAYMENT,
                payment.getType()==PaymentType.DEPOSIT_70?"Đã nhận tiền đặt cọc":"Đã nhận thanh toán còn lại",
                "Thanh toán "+payment.getAmountVnd().toPlainString()+" VND cho đơn "+order.getOrderCode()+" đã thành công.",
                "/orders/"+order.getId(),"PAYMENT:"+payment.getId()+":PAID");
    }
    @Transactional
    public PaymentView confirmBank(Long id, BigDecimal amount, String transactionCode, String note) {
        PaymentTransaction p=payments.findById(id).orElseThrow(() -> new EntityNotFoundException("Không tìm thấy giao dịch"));
        if (p.getMethod()!=PaymentMethod.BANK_TRANSFER) throw new IllegalArgumentException("Chỉ đối soát chuyển khoản tại đây");
        settle(PaymentMethod.BANK_TRANSFER,new PaymentGateway.VerifiedPayment(p.getMerchantReference(),amount,transactionCode,true));
        p.setReconciliationNote("Xác nhận bởi "+user.get().getEmail()+": "+note);
        return view(p);
    }
    @Transactional
    public PaymentView reconcile(Long id) {
        var p=payments.findById(id).orElseThrow(() -> new EntityNotFoundException("Không tìm thấy giao dịch"));
        user.requireId(p.getPayer().getId());
        return reconcileInternal(p);
    }
    @Transactional
    public void reconcileScheduled(Long id) {
        payments.findById(id).ifPresent(this::reconcileInternal);
    }
    private PaymentView reconcileInternal(PaymentTransaction p) {
        orders.lockById(p.getOrder().getId()).orElseThrow(); entityManager.refresh(p);
        if(p.getStatus()!=PaymentStatus.PENDING || p.getMethod()==PaymentMethod.BANK_TRANSFER) return view(p);
        if(p.getLastCheckedAt()!=null && p.getLastCheckedAt().isAfter(LocalDateTime.now().minusSeconds(60))) return view(p);
        p.markChecked();
        Optional<PaymentGateway.VerifiedPayment> result;
        try { result=gateway.query(p); }
        catch(Exception ex) {
            p.setReconciliationNote("Chưa kết nối được để tra soát. Giao dịch vẫn đang chờ; vui lòng thử lại sau.");
            return view(p);
        }
        if(result.isPresent()) {
            payments.flush();
            settle(p.getMethod(),result.get());
            p.setReconciliationNote("Đã xác nhận thanh toán qua tra soát nhà cung cấp");
        } else p.setReconciliationNote("Nhà cung cấp chưa xác nhận thanh toán thành công. Vui lòng kiểm tra lại sau.");
        return view(p);
    }
    @Transactional(readOnly=true)
    public List<PaymentView> pendingBank() {
        return payments.findByMethodAndStatusOrderByCreatedAtAsc(PaymentMethod.BANK_TRANSFER,PaymentStatus.PENDING).stream().map(this::view).toList();
    }
    private PaymentView view(PaymentTransaction p) {
        PaymentGateway.Instructions instructions=null;
        try { if(p.getInstructionsJson()!=null) instructions=mapper.readValue(p.getInstructionsJson(),PaymentGateway.Instructions.class); }
        catch(Exception ex) { throw new IllegalStateException("Không đọc được hướng dẫn thanh toán"); }
        return new PaymentView(p.getId(),p.getOrder().getId(),p.getOrder().getOrderCode(),p.getType(),p.getMethod(),p.getStatus(),
                p.getAmountVnd(),p.getMerchantReference(),instructions,p.getReconciliationNote());
    }
    private void validateType(PaymentType type) {
        if(type!=PaymentType.DEPOSIT_70 && type!=PaymentType.FINAL_30) throw new IllegalArgumentException("Loại thanh toán không hợp lệ");
    }
    private void validatePayable(PurchaseOrder order, PaymentType type) {
        if(type==PaymentType.DEPOSIT_70) {
            if(order.getStatus()!=OrderStatus.WAITING_DEPOSIT || order.getPaidAmountVnd().signum()!=0)
                throw new IllegalStateException("Đơn không còn chờ thanh toán cọc");
        } else if(order.getStatus()!=OrderStatus.WAITING_FINAL_PAYMENT || order.getPaidAmountVnd().compareTo(order.getDepositAmountVnd())<0
                || order.getTotalAmountVnd().compareTo(order.getPaidAmountVnd())<=0) {
            throw new IllegalStateException("Đơn chưa sẵn sàng thanh toán phần còn lại");
        }
    }
}
