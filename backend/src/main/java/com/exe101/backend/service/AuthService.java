package com.exe101.backend.service;

import com.exe101.backend.dto.LoginRequest;
import com.exe101.backend.dto.LoginResponse;
import com.exe101.backend.model.UserAccount;
import com.exe101.backend.repository.UserAccountRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {

    private final UserAccountRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserAccountRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse login(LoginRequest request) {
        UserAccount user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String accessToken = UUID.randomUUID().toString();
        return new LoginResponse(
                accessToken,
                "Bearer",
                user.getEmail(),
                user.getFullName(),
                user.getRole()
        );
    }
}
