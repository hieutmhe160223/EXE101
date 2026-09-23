package com.exe101.backend.service;

import com.exe101.backend.config.JwtService;
import com.exe101.backend.dto.*;
import com.exe101.backend.model.AccountStatus;
import com.exe101.backend.model.Role;
import com.exe101.backend.model.UserAccount;
import com.exe101.backend.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserAccountRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final StringRedisTemplate redisTemplate;
    private final JavaMailSender mailSender;

    public LoginResponse login(LoginRequest request) {
        UserAccount user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        // --- BỔ SUNG: KIỂM TRA TRẠNG THÁI TÀI KHOẢN KHI ĐĂNG NHẬP ---
        if (user.getStatus() == AccountStatus.LOCKED) {
            throw new BadCredentialsException("Tài khoản của bạn đã bị tạm khóa!");
        }
        if (user.getStatus() == AccountStatus.DISABLED) {
            throw new BadCredentialsException("Tài khoản của bạn đã bị vô hiệu hóa!");
        }
        // -------------------------------------------------------------

        String roleName = user.getRole().name();

        String accessToken = jwtService.generateToken(user.getEmail(), roleName);

        return new LoginResponse(
                accessToken,
                "Bearer",
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getPhoneNumber(),
                user.getDateOfBirth()
        );
    }

    public void register(RegisterRequest request) {
        if (!request.password().equals(request.confirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu xác nhận không trùng khớp!");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email này đã được đăng ký sử dụng!");
        }

        UserAccount user = new UserAccount(
                request.email(),
                passwordEncoder.encode(request.password()),
                request.fullName(),
                Role.CUSTOMER
        );
        user.setPhoneNumber(request.phoneNumber());
        // Giả sử trạng thái mặc định khi tạo mới là ACTIVE
        user.setStatus(AccountStatus.ACTIVE); 
        userRepository.save(user);
    }

    public void sendForgotPasswordOtp(ForgotPasswordRequest request) {
        UserAccount user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Email không tồn tại trong hệ thống!"));

        String otp = String.format("%06d", new Random().nextInt(999999));

        redisTemplate.opsForValue().set(request.email(), otp, 5, TimeUnit.MINUTES);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("yufiz.system@gmail.com");
        message.setTo(request.email());
        message.setSubject("[Yufiz System] Mã xác thực đặt lại mật khẩu");
        message.setText("Mã OTP của bạn là: " + otp + ". Mã này có hiệu lực trong vòng 5 phút.");
        mailSender.send(message);
    }

    public void verifyOtp(VerifyOtpRequest request) {
        String savedOtp = redisTemplate.opsForValue().get(request.email());
        if (savedOtp == null) {
            throw new IllegalArgumentException("Mã OTP đã hết hạn hoặc không tồn tại!");
        }
        if (!savedOtp.equals(request.otp())) {
            throw new IllegalArgumentException("Mã OTP không chính xác!");
        }
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        VerifyOtpRequest verifyRequest = new VerifyOtpRequest(request.email(), request.otp());
        verifyOtp(verifyRequest);

        UserAccount user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin tài khoản!"));

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        redisTemplate.delete(request.email());
    }
}