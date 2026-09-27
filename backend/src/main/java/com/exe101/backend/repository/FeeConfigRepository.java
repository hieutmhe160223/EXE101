package com.exe101.backend.repository;

import com.exe101.backend.model.FeeConfig;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeeConfigRepository extends JpaRepository<FeeConfig, Long> {
}