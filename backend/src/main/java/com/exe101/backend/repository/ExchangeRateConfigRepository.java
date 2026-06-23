package com.exe101.backend.repository;

import com.exe101.backend.model.ExchangeRateConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExchangeRateConfigRepository extends JpaRepository<ExchangeRateConfig, Long> {

    Optional<ExchangeRateConfig> findByCurrencyPair(String currencyPair);
}
