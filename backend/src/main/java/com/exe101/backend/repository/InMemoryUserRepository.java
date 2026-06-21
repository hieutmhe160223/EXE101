package com.exe101.backend.repository;

import com.exe101.backend.model.UserAccount;
import jakarta.annotation.PostConstruct;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class InMemoryUserRepository {

    private final PasswordEncoder passwordEncoder;
    private final Map<String, UserAccount> users = new ConcurrentHashMap<>();

    public InMemoryUserRepository(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void seedUsers() {
        users.put(
                "admin@example.com",
                new UserAccount(
                        "admin@example.com",
                        passwordEncoder.encode("Admin@123"),
                        "System Admin",
                        "ADMIN"
                )
        );
    }

    public Optional<UserAccount> findByEmail(String email) {
        return Optional.ofNullable(users.get(email));
    }
}

