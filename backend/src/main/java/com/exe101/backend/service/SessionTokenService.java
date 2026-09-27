package com.exe101.backend.service;
import com.exe101.backend.model.*;
import com.exe101.backend.repository.SessionTokenRepository;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
@Service
public class SessionTokenService {
    private final SessionTokenRepository repository;
    private final SecureRandom random = new SecureRandom();
    public SessionTokenService(SessionTokenRepository repository) { this.repository = repository; }
    public String issue(UserAccount user) {
        byte[] bytes = new byte[32]; random.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        repository.save(new SessionToken(hash(token), user, Instant.now().plus(24, ChronoUnit.HOURS)));
        return token;
    }
    public Optional<UserAccount> authenticate(String token) {
        if (token == null || token.length() > 256) return Optional.empty();
        return repository.findById(hash(token)).filter(s -> s.getExpiresAt().isAfter(Instant.now()))
                .map(SessionToken::getUser).filter(u -> u.getStatus() == AccountStatus.ACTIVE);
    }
    public void revoke(String token) { repository.deleteById(hash(token)); }
    private String hash(String token) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8))); }
        catch (NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }
}
