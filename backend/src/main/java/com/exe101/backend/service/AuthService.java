package com.exe101.backend.service;

import com.exe101.backend.config.JwtService;
import com.exe101.backend.dto.*;
import com.exe101.backend.exception.OtpDeliveryException;
import com.exe101.backend.model.AccountStatus;
import com.exe101.backend.model.Role;
import com.exe101.backend.model.UserAccount;
import com.exe101.backend.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.security.SecureRandom;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserAccountRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final SessionTokenService sessionTokens;
    private final StringRedisTemplate redisTemplate;
    private final JavaMailSender mailSender;
    @Value("${spring.mail.username:}")
    private String mailFrom;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public LoginResponse login(LoginRequest request) {
        UserAccount user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (user.getStatus() == AccountStatus.LOCKED) {
            throw new BadCredentialsException("Tài khoản của bạn đã bị tạm khóa!");
        }
        if (user.getStatus() == AccountStatus.DISABLED) {
            throw new BadCredentialsException("Tài khoản của bạn đã bị vô hiệu hóa!");
        }

        String roleName = user.getRole().name();
        String accessToken = jwtService.generateToken(user.getEmail(), roleName);
        sessionTokens.issue(user);

        return new LoginResponse(
                user.getId(),
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
        user.setStatus(AccountStatus.ACTIVE);
        userRepository.save(user);
    }

    private static final Map<String, OtpEntry> IN_MEMORY_OTP = new ConcurrentHashMap<>();

    private record OtpEntry(String otp, Instant expiresAt) {
        boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }
    }

    private void saveOtp(String email, String otp) {
        try {
            if (redisTemplate != null) {
                redisTemplate.opsForValue().set(email, otp, 5, TimeUnit.MINUTES);
                return;
            }
        } catch (Exception e) {
            System.err.println("[Redis Warning] Không thể kết nối Redis, chuyển sang lưu OTP in-memory: " + e.getMessage());
        }
        IN_MEMORY_OTP.put(email, new OtpEntry(otp, Instant.now().plusSeconds(300)));
    }

    private String getOtp(String email) {
        try {
            if (redisTemplate != null) {
                String val = redisTemplate.opsForValue().get(email);
                if (val != null) return val;
            }
        } catch (Exception e) {
            System.err.println("[Redis Warning] Không thể đọc Redis, chuyển sang kiểm tra in-memory: " + e.getMessage());
        }
        OtpEntry entry = IN_MEMORY_OTP.get(email);
        if (entry != null) {
            if (entry.isExpired()) {
                IN_MEMORY_OTP.remove(email);
                return null;
            }
            return entry.otp();
        }
        return null;
    }

    private void removeOtp(String email) {
        try {
            if (redisTemplate != null) {
                redisTemplate.delete(email);
            }
        } catch (Exception ignored) {
        }
        IN_MEMORY_OTP.remove(email);
    }

    public void sendForgotPasswordOtp(ForgotPasswordRequest request) {
        UserAccount user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Email không tồn tại trong hệ thống!"));

        String otp = String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(request.email());
            message.setSubject("[Yufiz System] Mã xác thực đặt lại mật khẩu");
            message.setText("Mã OTP của bạn là: " + otp + ". Mã này có hiệu lực trong vòng 5 phút.");
            mailSender.send(message);
        } catch (Exception e) {
            throw new OtpDeliveryException("Không thể gửi email OTP. Vui lòng thử lại sau.", e);
        }
        saveOtp(request.email(), otp);
    }

    public void verifyOtp(VerifyOtpRequest request) {
        String savedOtp = getOtp(request.email());
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
        removeOtp(request.email());
    }
}