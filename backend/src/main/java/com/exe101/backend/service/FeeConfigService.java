package com.exe101.backend.service;

import com.exe101.backend.model.FeeConfig;
import com.exe101.backend.repository.FeeConfigRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

@Service
public class FeeConfigService {

    private final FeeConfigRepository repository;
    private volatile FeeConfig cached; // volatile vì có thể đọc/ghi từ nhiều thread

    public FeeConfigService(FeeConfigRepository repository) {
        this.repository = repository;
    }

    @PostConstruct
    public void init() {
        cached = repository.findById(1L).orElseGet(() -> repository.save(new FeeConfig()));
    }

    public FeeConfig getConfig() {
        return cached;
    }

    public synchronized FeeConfig updateConfig(FeeConfig updated) {
        if (updated.getDepositPercent() == null || updated.getDepositPercent().compareTo(new java.math.BigDecimal("0.70")) != 0
                || updated.getServiceFeePercent() == null || updated.getServiceFeePercent().compareTo(new java.math.BigDecimal("0.05")) != 0)
            throw new IllegalArgumentException("Chính sách hiện tại: cọc 70% và phí dịch vụ 5%");
        if (updated.getDomesticShippingCny() == null || updated.getDomesticShippingCny().signum() < 0
                || updated.getInternationalShippingVnd() == null || updated.getInternationalShippingVnd().signum() < 0
                || updated.getInsuranceVnd() == null || updated.getInsuranceVnd().signum() < 0
                || updated.getQuoteCacheTtlHours() == null || updated.getQuoteCacheTtlHours() < 1 || updated.getQuoteCacheTtlHours() > 24)
            throw new IllegalArgumentException("Phí không được âm và thời hạn báo giá phải từ 1 đến 24 giờ");
        updated.setId(1L); // đảm bảo luôn ghi đè đúng dòng duy nhất
        cached = repository.save(updated);
        return cached;
    }
}