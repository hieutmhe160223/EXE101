package com.exe101.backend.repository;
import com.exe101.backend.model.SessionToken;
import org.springframework.data.jpa.repository.JpaRepository;
public interface SessionTokenRepository extends JpaRepository<SessionToken, String> {}
