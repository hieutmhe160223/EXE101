package com.exe101.backend.repository;

import com.exe101.backend.model.ServiceFeeConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ServiceFeeConfigRepository extends JpaRepository<ServiceFeeConfig, Long> {

    Optional<ServiceFeeConfig> findByFeeCode(String feeCode);
}
