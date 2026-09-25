package com.exe101.backend.repository;

import com.exe101.backend.model.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select u from UserAccount u where u.id = :id")
    java.util.Optional<UserAccount> lockById(@org.springframework.data.repository.query.Param("id") Long id);
    Optional<UserAccount> findByEmail(String email);
    boolean existsByEmail(String email);
}