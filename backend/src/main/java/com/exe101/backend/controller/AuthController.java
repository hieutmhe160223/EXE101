package com.exe101.backend.controller;

import com.exe101.backend.dto.ForgotPasswordRequest;
import com.exe101.backend.dto.LoginRequest;
import com.exe101.backend.dto.LoginResponse;
import com.exe101.backend.dto.RegisterRequest;
import com.exe101.backend.dto.ResetPasswordRequest;
import com.exe101.backend.dto.VerifyOtpRequest;
import com.exe101.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok("Đăng ký tài khoản thành công!");
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.sendForgotPasswordOtp(request);
        return ResponseEntity.ok("Mã OTP đặt lại mật khẩu đã được gửi đến email của bạn.");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        authService.verifyOtp(request);
        return ResponseEntity.ok("Xác thực mã OTP thành công. Bạn có thể tiến hành đổi mật khẩu mới.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Mật khẩu của bạn đã được cập nhật thành công!");
    }
}

