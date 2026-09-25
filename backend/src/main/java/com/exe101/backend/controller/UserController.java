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
    private final com.exe101.backend.service.CurrentUser currentUser;

    public UserController(UserService userService, com.exe101.backend.service.CurrentUser currentUser) {
        this.currentUser = currentUser;
        this.userService = userService;
    }

    @PutMapping("/profile")
    public ResponseEntity<String> updateProfile(@jakarta.validation.Valid @RequestBody UpdateProfileRequest request) {
        currentUser.requireEmail(request.email());
        userService.updateProfile(request);
        return ResponseEntity.ok("Cập nhật thông tin thành công!");
    }
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        currentUser.requireEmail(request.getEmail());
        try {
            userService.changePassword(request.getEmail(), request);
            return ResponseEntity.ok("Đổi mật khẩu thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/addresses")
    public ResponseEntity<?> addAddress(@RequestBody AddressRequest request) {
        currentUser.requireEmail(request.getEmail());
        try {
            userService.addShippingAddress(request);
            return ResponseEntity.ok("Thêm địa chỉ giao hàng thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/addresses")
    public ResponseEntity<?> getUserAddresses(@RequestParam String email) {
        currentUser.requireEmail(email);
        try {
            List<AddressResponse> addresses = userService.getUserAddressesByEmail(email);
            return ResponseEntity.ok(addresses);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
