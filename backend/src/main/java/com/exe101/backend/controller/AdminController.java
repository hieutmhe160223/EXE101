package com.exe101.backend.controller;

import com.exe101.backend.dto.AdminDTO;
import com.exe101.backend.model.AccountStatus;
import com.exe101.backend.model.OrderStatus;
import com.exe101.backend.model.ReturnRequestStatus;
import com.exe101.backend.service.AdminService;
import com.exe101.backend.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;
    private final SystemConfigService systemConfigService;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDTO.DashboardResponse> getDashboardData() {
        return ResponseEntity.ok(adminService.getDashboardData());
    }

    @GetMapping("/customers")
    public ResponseEntity<Page<AdminDTO.CustomerResponse>> getCustomers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) AccountStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(adminService.getAdminCustomers(keyword, status, page, size));
    }

    @PatchMapping("/customers/{id}/status")
    public ResponseEntity<String> updateCustomerStatus(
            @PathVariable Long id,
            @RequestBody AdminDTO.UpdateStatusRequest request
    ) {
        adminService.updateAccountStatus(id, request.status());
        return ResponseEntity.ok("Cập nhật trạng thái tài khoản thành công!");
    }

    @GetMapping("/customers/{id}")
    public ResponseEntity<AdminDTO.CustomerDetailResponse> getCustomerDetail(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getCustomerDetailForAdmin(id));
    }

    @GetMapping("/orders")
    public ResponseEntity<Page<AdminDTO.OrderResponse>> getOrders(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(adminService.getAdminOrders(keyword, status, page, size));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<AdminDTO.OrderDetailResponse> getOrderDetail(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getAdminOrderDetail(id));
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<AdminDTO.OrderDetailResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody AdminDTO.UpdateOrderStatusRequest request
    ) {
        return ResponseEntity.ok(adminService.updateOrderStatus(id, request.status()));
    }

    @GetMapping("/complaints")
    public ResponseEntity<Page<AdminDTO.ComplaintResponse>> getComplaints(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ReturnRequestStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(adminService.getAdminComplaints(keyword, status, page, size));
    }

    @GetMapping("/complaints/{id}")
    public ResponseEntity<AdminDTO.ComplaintResponse> getComplaint(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getAdminComplaint(id));
    }

    @PatchMapping("/complaints/{id}")
    public ResponseEntity<AdminDTO.ComplaintResponse> updateComplaint(
            @PathVariable Long id,
            @RequestBody AdminDTO.UpdateComplaintRequest request
    ) {
        return ResponseEntity.ok(adminService.updateComplaint(id, request.status(), request.adminNote()));
    }

    @GetMapping("/settings")
    public ResponseEntity<AdminDTO.SystemSettingsResponse> getSettings() {
        return ResponseEntity.ok(systemConfigService.getSettings());
    }

    @PatchMapping("/settings")
    public ResponseEntity<AdminDTO.SystemSettingsResponse> updateSettings(
            @RequestBody AdminDTO.UpdateSystemSettingsRequest request
    ) {
        return ResponseEntity.ok(systemConfigService.updateSettings(request));
    }

    @PostMapping("/settings/exchange-rate/refresh")
    public ResponseEntity<AdminDTO.SystemSettingsResponse> refreshExchangeRate() {
        return ResponseEntity.ok(systemConfigService.refreshExchangeRate());
    }

    @GetMapping("/reports")
    public ResponseEntity<AdminDTO.ReportResponse> getReport(
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to
    ) {
        return ResponseEntity.ok(adminService.getReport(from, to));
    }

    @GetMapping("/coupons")
    public ResponseEntity<Page<AdminDTO.CouponResponse>> getCoupons(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(adminService.getAdminCoupons(keyword, page, size));
    }

    @PostMapping("/coupons")
    public ResponseEntity<AdminDTO.CouponResponse> createCoupon(@RequestBody AdminDTO.CouponRequest request) {
        return ResponseEntity.ok(adminService.createCoupon(request));
    }

    @PutMapping("/coupons/{id}")
    public ResponseEntity<AdminDTO.CouponResponse> updateCoupon(
            @PathVariable Long id, @RequestBody AdminDTO.CouponRequest request) {
        return ResponseEntity.ok(adminService.updateCoupon(id, request));
    }

    @PatchMapping("/coupons/{id}/active")
    public ResponseEntity<AdminDTO.CouponResponse> toggleCoupon(
            @PathVariable Long id, @RequestParam boolean active) {
        return ResponseEntity.ok(adminService.toggleCoupon(id, active));
    }
}