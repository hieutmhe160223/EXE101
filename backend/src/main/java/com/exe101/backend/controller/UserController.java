package com.exe101.backend.controller;

import com.exe101.backend.dto.AddressRequest;
import com.exe101.backend.dto.AddressResponse;
import com.exe101.backend.dto.ChangePasswordRequest;
import com.exe101.backend.dto.UpdateProfileRequest;
import com.exe101.backend.model.UserAddress;
import com.exe101.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PutMapping("/profile")
    public ResponseEntity<String> updateProfile(@RequestBody UpdateProfileRequest request) {
        userService.updateProfile(request);
        return ResponseEntity.ok("Cập nhật thông tin thành công!");
    }
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            userService.changePassword(request.getEmail(), request);
            return ResponseEntity.ok("Đổi mật khẩu thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/addresses")
    public ResponseEntity<?> addAddress(@RequestBody AddressRequest request) {
        try {
            userService.addShippingAddress(request);
            return ResponseEntity.ok("Thêm địa chỉ giao hàng thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/addresses")
    public ResponseEntity<?> getUserAddresses(@RequestParam String email) {
        try {
            List<AddressResponse> addresses = userService.getUserAddressesByEmail(email);
            return ResponseEntity.ok(addresses);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PutMapping("/addresses/{id}")
    public ResponseEntity<?> updateAddress(@PathVariable Long id, @RequestBody AddressRequest request) {
    try {
        userService.updateShippingAddress(id, request);
        return ResponseEntity.ok("Cập nhật địa chỉ thành công!");
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long id) {
    try {
        userService.deleteShippingAddress(id);
        return ResponseEntity.ok("Xóa địa chỉ giao hàng thành công!");
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
    }

    @GetMapping("/banks")
    public ResponseEntity<?> getBankAccounts(@RequestParam String email) {
        try {
            return ResponseEntity.ok(userService.getBankAccounts(email));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/banks")
    public ResponseEntity<?> addBankAccount(@RequestBody com.exe101.backend.dto.BankRequest request) {
        try {
            userService.addBankAccount(request);
            return ResponseEntity.ok("Thêm tài khoản ngân hàng thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/banks/{id}")
    public ResponseEntity<?> updateBankAccount(@PathVariable Long id, @RequestBody com.exe101.backend.dto.BankRequest request) {
        try {
            userService.updateBankAccount(id, request);
            return ResponseEntity.ok("Cập nhật tài khoản ngân hàng thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/banks/{id}")
    public ResponseEntity<?> deleteBankAccount(@PathVariable Long id) {
        try {
            userService.deleteBankAccount(id);
            return ResponseEntity.ok("Xóa tài khoản ngân hàng thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}