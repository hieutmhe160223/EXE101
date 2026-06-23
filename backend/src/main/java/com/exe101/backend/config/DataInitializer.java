package com.exe101.backend.config;

import com.exe101.backend.model.UserAccount;
import com.exe101.backend.model.ExchangeRateConfig;
import com.exe101.backend.model.ServiceFeeConfig;
import com.exe101.backend.repository.ExchangeRateConfigRepository;
import com.exe101.backend.repository.ServiceFeeConfigRepository;
import com.exe101.backend.repository.UserAccountRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedDefaultData(
            UserAccountRepository userRepository,
            ExchangeRateConfigRepository exchangeRateConfigRepository,
            ServiceFeeConfigRepository serviceFeeConfigRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            userRepository.findByEmail("admin@example.com")
                    .orElseGet(() -> userRepository.save(new UserAccount(
                            "admin@example.com",
                            passwordEncoder.encode("Admin@123"),
                            "System Admin",
                            "ADMIN"
                    )));

            userRepository.findByEmail("customer@example.com")
                    .orElseGet(() -> userRepository.save(new UserAccount(
                            "customer@example.com",
                            passwordEncoder.encode("Customer@123"),
                            "Demo Customer",
                            "CUSTOMER"
                    )));

            exchangeRateConfigRepository.findByCurrencyPair("CNYVND")
                    .orElseGet(() -> exchangeRateConfigRepository.save(new ExchangeRateConfig(
                            "CNYVND",
                            new BigDecimal("3600.00")
                    )));

            serviceFeeConfigRepository.findByFeeCode("ORDER_SERVICE_PERCENT")
                    .orElseGet(() -> serviceFeeConfigRepository.save(new ServiceFeeConfig(
                            "ORDER_SERVICE_PERCENT",
                            "Phi dich vu dat hang",
                            new BigDecimal("8.00"),
                            true
                    )));

            serviceFeeConfigRepository.findByFeeCode("INTERNATIONAL_SHIPPING_BASE")
                    .orElseGet(() -> serviceFeeConfigRepository.save(new ServiceFeeConfig(
                            "INTERNATIONAL_SHIPPING_BASE",
                            "Phi van chuyen quoc te mac dinh",
                            new BigDecimal("35000.00"),
                            false
                    )));
        };
    }
}
