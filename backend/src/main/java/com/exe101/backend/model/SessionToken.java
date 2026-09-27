package com.exe101.backend.model;
import jakarta.persistence.*;
import java.time.Instant;
@Entity
@Table(name = "session_tokens")
public class SessionToken {
    @Id private String tokenHash;
    @ManyToOne(fetch = FetchType.EAGER, optional = false) private UserAccount user;
    @Column(nullable = false) private Instant expiresAt;
    protected SessionToken() {}
    public SessionToken(String tokenHash, UserAccount user, Instant expiresAt) {
        this.tokenHash = tokenHash; this.user = user; this.expiresAt = expiresAt;
    }
    public UserAccount getUser() { return user; }
    public Instant getExpiresAt() { return expiresAt; }
}
