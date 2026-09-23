package com.exe101.backend.service;

import com.exe101.backend.dto.AdminDTO;
import com.exe101.backend.dto.AddressResponse;
import com.exe101.backend.dto.BankResponse;
import com.exe101.backend.model.AccountStatus;
import com.exe101.backend.model.OrderStatus;
import com.exe101.backend.model.PurchaseOrder;
import com.exe101.backend.model.ReturnRequest;
import com.exe101.backend.model.ReturnRequestStatus;
import com.exe101.backend.model.UserAccount;
import com.exe101.backend.model.Voucher;
import com.exe101.backend.repository.PurchaseOrderRepository;
import com.exe101.backend.repository.ReturnRequestRepository;
import com.exe101.backend.repository.UserAccountRepository;
import com.exe101.backend.repository.UserVoucherRepository;
import com.exe101.backend.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.EnumMap;
import java.util.Map;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final UserAccountRepository userAccountRepository;
    private final ReturnRequestRepository returnRequestRepository;
    private final UserService userService; 
        private final VoucherRepository voucherRepository;
        private final UserVoucherRepository userVoucherRepository;

    @Transactional(readOnly = true)
    public AdminDTO.DashboardResponse getDashboardData() {
        long totalOrders = purchaseOrderRepository.count();
                List<PurchaseOrder> allOrders = purchaseOrderRepository.findAll();

                double totalRevenue = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .map(PurchaseOrder::getTotalAmountVnd)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .doubleValue();

        long totalCustomers = userAccountRepository.count();
        long totalComplaints = returnRequestRepository.count();

        List<AdminDTO.OrderStatusCount> statusCounts = purchaseOrderRepository.countOrdersByStatus();

        List<AdminDTO.MonthlyRevenue> monthlyRevenues = buildDashboardMonthlyRevenue(allOrders);

        List<AdminDTO.RecentOrder> recentOrders = purchaseOrderRepository.findTop5ByOrderByCreatedAtDesc().stream()
                .map(o -> new AdminDTO.RecentOrder(
                        o.getOrderCode(),
                        o.getCustomer() != null ? o.getCustomer().getFullName() : "N/A",
                        o.getProductQuote() != null ? "Sản phẩm báo giá" : "Sản phẩm order",
                        o.getStatus(),
                        o.getTotalAmountVnd().doubleValue()
                ))
                .toList();

        return new AdminDTO.DashboardResponse(
                totalOrders,
                totalRevenue,
                totalCustomers,
                totalComplaints,
                monthlyRevenues,
                statusCounts,
                recentOrders
        );
    }

        private List<AdminDTO.MonthlyRevenue> buildDashboardMonthlyRevenue(List<PurchaseOrder> orders) {
                YearMonth currentMonth = YearMonth.now();
                List<AdminDTO.MonthlyRevenue> monthlyRevenue = new java.util.ArrayList<>();

                for (int offset = 5; offset >= 0; offset--) {
                        YearMonth month = currentMonth.minusMonths(offset);
                        BigDecimal revenue = orders.stream()
                                        .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
                                        .filter(order -> order.getCreatedAt() != null && YearMonth.from(order.getCreatedAt()).equals(month))
                                        .map(PurchaseOrder::getTotalAmountVnd)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                        monthlyRevenue.add(new AdminDTO.MonthlyRevenue(
                                        String.format("T%s/%s", month.getMonthValue(), month.getYear()),
                                        revenue.doubleValue()));
                }
                return monthlyRevenue;
        }

        @Transactional(readOnly = true)
        public Page<AdminDTO.CouponResponse> getAdminCoupons(String keyword, int page, int size) {
                String search = keyword == null ? "" : keyword.trim();
                Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
                return voucherRepository.findByCodeContainingIgnoreCaseOrNameContainingIgnoreCase(search, search, pageable)
                                .map(this::toCouponResponse);
        }

        @Transactional
        public AdminDTO.CouponResponse createCoupon(AdminDTO.CouponRequest request) {
                validateCoupon(request);
                if (voucherRepository.findByCodeIgnoreCase(request.code().trim()).isPresent()) {
                        throw new IllegalArgumentException("Mã giảm giá đã tồn tại");
                }
                Voucher voucher = new Voucher(request.code().trim().toUpperCase(), request.name().trim(), request.discountValue(),
                                request.percentage(), request.maxDiscountVnd(), request.minimumOrderVnd(), request.startsAt(),
                                request.endsAt(), request.usageLimit());
                voucher.setActive(request.active() == null || request.active());
                return toCouponResponse(voucherRepository.save(voucher));
        }

        @Transactional
        public AdminDTO.CouponResponse updateCoupon(Long id, AdminDTO.CouponRequest request) {
                validateCoupon(request);
                Voucher voucher = voucherRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã giảm giá"));
                voucherRepository.findByCodeIgnoreCase(request.code().trim()).ifPresent(existing -> {
                        if (!existing.getId().equals(id)) throw new IllegalArgumentException("Mã giảm giá đã tồn tại");
                });
                voucher.update(request.code().trim().toUpperCase(), request.name().trim(), request.discountValue(), request.percentage(),
                                request.maxDiscountVnd(), request.minimumOrderVnd(), request.startsAt(), request.endsAt(), request.usageLimit());
                voucher.setActive(request.active() == null || request.active());
                return toCouponResponse(voucherRepository.save(voucher));
        }

        @Transactional
        public AdminDTO.CouponResponse toggleCoupon(Long id, boolean active) {
                Voucher voucher = voucherRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã giảm giá"));
                voucher.setActive(active);
                return toCouponResponse(voucherRepository.save(voucher));
        }

        private AdminDTO.CouponResponse toCouponResponse(Voucher voucher) {
                return new AdminDTO.CouponResponse(voucher.getId(), voucher.getCode(), voucher.getName(), voucher.getDiscountValue(),
                                voucher.getPercentage(), voucher.getMaxDiscountVnd(), voucher.getMinimumOrderVnd(), voucher.getStartsAt(),
                                voucher.getEndsAt(), voucher.getActive(), voucher.getUsageLimit(), userVoucherRepository.countByVoucherIdAndUsedAtIsNotNull(voucher.getId()));
        }

        private void validateCoupon(AdminDTO.CouponRequest request) {
                if (request == null || request.code() == null || request.code().isBlank() || request.name() == null || request.name().isBlank()
                                || request.discountValue() == null || request.discountValue().signum() <= 0
                                || request.percentage() == null || request.minimumOrderVnd() == null || request.minimumOrderVnd().signum() < 0
                                || request.usageLimit() == null || request.usageLimit() < 0
                                || (request.percentage() && request.discountValue().compareTo(BigDecimal.valueOf(100)) > 0)
                                || (request.startsAt() != null && request.endsAt() != null && request.endsAt().isBefore(request.startsAt()))) {
                        throw new IllegalArgumentException("Thông tin mã giảm giá không hợp lệ");
                }
        }

    @Transactional(readOnly = true)
    public AdminDTO.ReportResponse getReport(LocalDate from, LocalDate to) {
        LocalDate reportFrom = from == null ? LocalDate.now().withDayOfMonth(1) : from;
        LocalDate reportTo = to == null ? LocalDate.now() : to;
        if (reportTo.isBefore(reportFrom)) {
            throw new IllegalArgumentException("Khoảng thời gian báo cáo không hợp lệ");
        }

        LocalDateTime fromTime = reportFrom.atStartOfDay();
        LocalDateTime toTime = reportTo.plusDays(1).atStartOfDay();
        List<PurchaseOrder> orders = purchaseOrderRepository.findAll().stream()
                .filter(order -> isInRange(order.getCreatedAt(), fromTime, toTime))
                .toList();

        Map<OrderStatus, Long> statusCounts = new EnumMap<>(OrderStatus.class);
        orders.forEach(order -> statusCounts.merge(order.getStatus(), 1L, Long::sum));
        List<AdminDTO.OrderStatusCount> statusData = statusCounts.entrySet().stream()
                .map(entry -> new AdminDTO.OrderStatusCount(entry.getKey(), entry.getValue()))
                .toList();

        BigDecimal revenue = orders.stream()
                .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
                .map(PurchaseOrder::getTotalAmountVnd)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long newCustomers = userAccountRepository.findAll().stream()
                .filter(customer -> customer.getRole() != com.exe101.backend.model.Role.ADMIN)
                .filter(customer -> isInRange(customer.getCreatedAt(), fromTime, toTime))
                .count();
        long complaints = returnRequestRepository.findAll().stream()
                .filter(complaint -> isInRange(complaint.getCreatedAt(), fromTime, toTime))
                .count();

        List<AdminDTO.ReportPoint> monthlyData = buildReportPoints(orders, reportFrom, reportTo);
        long completedOrders = orders.stream().filter(order -> order.getStatus() == OrderStatus.COMPLETED).count();
        return new AdminDTO.ReportResponse(
                reportFrom.toString(), reportTo.toString(), orders.size(), completedOrders,
                newCustomers, complaints, revenue, monthlyData, statusData);
    }

    private List<AdminDTO.ReportPoint> buildReportPoints(List<PurchaseOrder> orders, LocalDate from, LocalDate to) {
        YearMonth firstMonth = YearMonth.from(from);
        YearMonth lastMonth = YearMonth.from(to);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/yyyy");
        List<AdminDTO.ReportPoint> points = new java.util.ArrayList<>();
        for (YearMonth month = firstMonth; !month.isAfter(lastMonth); month = month.plusMonths(1)) {
            final YearMonth currentMonth = month;
            List<PurchaseOrder> monthOrders = orders.stream()
                    .filter(order -> order.getCreatedAt() != null && YearMonth.from(order.getCreatedAt()).equals(currentMonth))
                    .toList();
            BigDecimal revenue = monthOrders.stream()
                    .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
                    .map(PurchaseOrder::getTotalAmountVnd)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            points.add(new AdminDTO.ReportPoint(month.format(formatter), monthOrders.size(), revenue));
        }
        return points;
    }

    private boolean isInRange(LocalDateTime value, LocalDateTime from, LocalDateTime to) {
        return value != null && !value.isBefore(from) && value.isBefore(to);
    }

    @Transactional(readOnly = true)
    public List<AdminDTO.CustomerResponse> getAllCustomers() {
        return userAccountRepository.findAllCustomersWithStats();
    }

    @Transactional(readOnly = true)
    public Page<AdminDTO.CustomerResponse> getAdminCustomers(String keyword, AccountStatus status, int page, int size) {
        String searchKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        return userAccountRepository.searchCustomersForAdmin(searchKeyword, status, pageable);
    }

        @Transactional(readOnly = true)
        public Page<AdminDTO.OrderResponse> getAdminOrders(String keyword, OrderStatus status, int page, int size) {
                String searchKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
                Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
                return purchaseOrderRepository.searchOrdersForAdmin(searchKeyword, status, pageable)
                                .map(this::toOrderResponse);
        }

        @Transactional(readOnly = true)
        public AdminDTO.OrderDetailResponse getAdminOrderDetail(Long orderId) {
                PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + orderId));
                return toOrderDetailResponse(order);
        }

        @Transactional
        public AdminDTO.OrderDetailResponse updateOrderStatus(Long orderId, OrderStatus status) {
                if (status == null) {
                        throw new IllegalArgumentException("Trạng thái đơn hàng không được để trống");
                }
                PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + orderId));
                order.changeStatus(status);
                return toOrderDetailResponse(order);
        }

        private AdminDTO.OrderResponse toOrderResponse(PurchaseOrder order) {
                return new AdminDTO.OrderResponse(
                                order.getId(), order.getOrderCode(), order.getCustomer().getFullName(),
                                order.getCustomer().getEmail(), getProductName(order), order.getStatus(),
                                order.getTotalAmountVnd(), order.getQuantity(), order.getCreatedAt());
        }

        private AdminDTO.OrderDetailResponse toOrderDetailResponse(PurchaseOrder order) {
                return new AdminDTO.OrderDetailResponse(
                                order.getId(), order.getOrderCode(), order.getCustomer().getFullName(),
                                order.getCustomer().getEmail(), order.getCustomer().getPhoneNumber(), order.getStatus(),
                                order.getQuantity(), order.getTotalAmountVnd(), order.getDepositAmountVnd(),
                                order.getFinalAmountVnd(), order.getPaidAmountVnd(), order.getShippingAddress(),
                                order.getCustomerNote(), order.getCreatedAt(), order.getUpdatedAt());
        }

        private String getProductName(PurchaseOrder order) {
                return order.getProductQuote() != null ? "Sản phẩm báo giá" : "Sản phẩm order";
        }

    /**
     * Cập nhật trạng thái tài khoản (ACTIVE, LOCKED, DISABLED)
     */
    @Transactional
    public void updateAccountStatus(Long userId, AccountStatus newStatus) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));

        user.setStatus(newStatus);
        userAccountRepository.save(user);
    }

        @Transactional(readOnly = true)
        public Page<AdminDTO.ComplaintResponse> getAdminComplaints(String keyword, ReturnRequestStatus status, int page, int size) {
                String searchKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
                Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
                return returnRequestRepository.searchForAdmin(searchKeyword, status, pageable).map(this::toComplaintResponse);
        }

        @Transactional(readOnly = true)
        public AdminDTO.ComplaintResponse getAdminComplaint(Long complaintId) {
                ReturnRequest complaint = returnRequestRepository.findById(complaintId)
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy khiếu nại với ID: " + complaintId));
                return toComplaintResponse(complaint);
        }

        @Transactional
        public AdminDTO.ComplaintResponse updateComplaint(Long complaintId, ReturnRequestStatus status, String adminNote) {
                if (status == null) {
                        throw new IllegalArgumentException("Trạng thái khiếu nại không được để trống");
                }
                ReturnRequest complaint = returnRequestRepository.findById(complaintId)
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy khiếu nại với ID: " + complaintId));
                complaint.updateStatus(status, adminNote);
                return toComplaintResponse(complaint);
        }

        private AdminDTO.ComplaintResponse toComplaintResponse(ReturnRequest complaint) {
                return new AdminDTO.ComplaintResponse(
                                complaint.getId(), complaint.getOrder().getId(), complaint.getOrder().getOrderCode(),
                                complaint.getCustomer().getFullName(), complaint.getCustomer().getEmail(),
                                complaint.getReason(), complaint.getEvidenceUrl(), complaint.getStatus(),
                                complaint.getAdminNote(), complaint.getCreatedAt());
        }

    /**
     * Lấy chi tiết thông tin khách hàng cho Popup/Modal
     */
    @Transactional(readOnly = true)
    public AdminDTO.CustomerDetailResponse getCustomerDetailForAdmin(Long userId) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));

        // Tận dụng UserService để lấy danh sách địa chỉ và tài khoản ngân hàng
        List<AddressResponse> addresses = userService.getUserAddressesByEmail(user.getEmail());
        List<BankResponse> banks = userService.getBankAccounts(user.getEmail());

        // Lấy tổng số đơn hàng của khách hàng
        long totalOrders = userAccountRepository.findAllCustomersWithStats().stream()
                .filter(c -> c.id().equals(userId))
                .mapToLong(AdminDTO.CustomerResponse::totalOrders)
                .findFirst()
                .orElse(0L);

        return new AdminDTO.CustomerDetailResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getDateOfBirth(),
                user.getAvatarUrl(),
                user.getRole(),
                user.getLoyaltyPoints(),
                user.getWalletBalance(),
                user.getStatus(),
                totalOrders,
                addresses,
                banks
        );
    }
}