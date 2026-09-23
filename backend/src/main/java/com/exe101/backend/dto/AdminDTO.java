package com.exe101.backend.dto;

import com.exe101.backend.model.AccountStatus;
import com.exe101.backend.model.OrderStatus;
import com.exe101.backend.model.Role;
import com.exe101.backend.model.ReturnRequestStatus;
import java.math.BigDecimal;
import java.util.List;

public class AdminDTO {

    // --- 1. DTO cho Khách hàng (Hiển thị Bảng & Phân Trang) ---
    public record CustomerResponse(
        Long id,
        String fullName,
        String email,
        String phoneNumber,
        long totalOrders,
        BigDecimal walletBalance,
        AccountStatus status
    ) {}

    // --- 2. DTO Cập nhật Trạng thái Tài khoản (ACTIVE, LOCKED, DISABLED) ---
    public record UpdateStatusRequest(
        AccountStatus status
    ) {}

    // --- 3. DTO Cho Popup Xem Chi Tiết Khách Hàng ---
    public record CustomerDetailResponse(
        Long id,
        String fullName,
        String email,
        String phoneNumber,
        String dateOfBirth,
        String avatarUrl,
        Role role,
        Integer loyaltyPoints,
        BigDecimal walletBalance,
        AccountStatus status,
        long totalOrders,
        List<AddressResponse> addresses,
        List<BankResponse> banks
    ) {}

    public record OrderResponse(
        Long id, String orderCode, String customerName, String customerEmail,
        String productName, OrderStatus status, BigDecimal totalAmountVnd,
        Integer quantity, java.time.LocalDateTime createdAt
    ) {}

    public record OrderDetailResponse(
        Long id, String orderCode, String customerName, String customerEmail,
        String customerPhone, OrderStatus status, Integer quantity,
        BigDecimal totalAmountVnd, BigDecimal depositAmountVnd, BigDecimal finalAmountVnd,
        BigDecimal paidAmountVnd, String shippingAddress, String customerNote,
        java.time.LocalDateTime createdAt, java.time.LocalDateTime updatedAt
    ) {}

    public record UpdateOrderStatusRequest(OrderStatus status) {}

    public record ComplaintResponse(
        Long id, Long orderId, String orderCode, String customerName, String customerEmail,
        String reason, String evidenceUrl, ReturnRequestStatus status,
        String adminNote, java.time.LocalDateTime createdAt
    ) {}

    public record UpdateComplaintRequest(ReturnRequestStatus status, String adminNote) {}

    public record SystemSettingsResponse(
        BigDecimal exchangeRate,
        BigDecimal serviceFeeMinPercent,
        BigDecimal serviceFeeMaxPercent,
        BigDecimal domesticShippingCny,
        BigDecimal internationalShippingVnd,
        java.time.LocalDateTime updatedAt
    ) {}

    public record UpdateSystemSettingsRequest(
        BigDecimal exchangeRate,
        BigDecimal serviceFeeMinPercent,
        BigDecimal serviceFeeMaxPercent,
        BigDecimal domesticShippingCny,
        BigDecimal internationalShippingVnd
    ) {}

    public record ReportPoint(String label, long orders, BigDecimal revenue) {}

    public record ReportResponse(
        String from,
        String to,
        long totalOrders,
        long completedOrders,
        long newCustomers,
        long complaints,
        BigDecimal totalRevenue,
        List<ReportPoint> monthlyData,
        List<OrderStatusCount> statusCounts
    ) {}

    public record CouponResponse(
        Long id, String code, String name, BigDecimal discountValue, Boolean percentage,
        BigDecimal maxDiscountVnd, BigDecimal minimumOrderVnd,
        java.time.LocalDateTime startsAt, java.time.LocalDateTime endsAt,
        Boolean active, Integer usageLimit, long usedCount
    ) {}

    public record CouponRequest(
        String code, String name, BigDecimal discountValue, Boolean percentage,
        BigDecimal maxDiscountVnd, BigDecimal minimumOrderVnd,
        java.time.LocalDateTime startsAt, java.time.LocalDateTime endsAt,
        Integer usageLimit, Boolean active
    ) {}

    // --- 4. Các DTO cho Dashboard ---
    public record OrderStatusCount(OrderStatus status, Long count) {}
    public record MonthlyRevenue(String month, double revenue) {}
    public record RecentOrder(String orderCode, String customerName, String productType, OrderStatus status, double totalAmount) {}

    public record DashboardResponse(
        long totalOrders,
        double totalRevenue,
        long totalCustomers,
        long totalComplaints,
        List<MonthlyRevenue> monthlyRevenues,
        List<OrderStatusCount> statusCounts,
        List<RecentOrder> recentOrders
    ) {}
}