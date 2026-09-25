package com.exe101.backend.service;
import com.exe101.backend.dto.LoginRequest;
import com.exe101.backend.dto.LoginResponse;
import com.exe101.backend.dto.RegisterRequest;
import com.exe101.backend.model.UserAccount;
import com.exe101.backend.repository.UserAccountRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class AuthService {
    private final UserAccountRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SessionTokenService sessionTokens;
    public AuthService(UserAccountRepository userRepository, PasswordEncoder passwordEncoder, SessionTokenService sessionTokens) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.sessionTokens = sessionTokens;
    }
    public LoginResponse login(LoginRequest request) {
        UserAccount user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }
        if (user.getStatus() != com.exe101.backend.model.AccountStatus.ACTIVE) {
            throw new BadCredentialsException("Tài khoản không hoạt động");
        }
        String accessToken = sessionTokens.issue(user);
        return new LoginResponse(
                user.getId(),
                accessToken,
                "Bearer",
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getPhoneNumber()
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
            "CUSTOMER"
        );
        user.setPhoneNumber(request.phoneNumber());
        userRepository.save(user);
    }
} 

