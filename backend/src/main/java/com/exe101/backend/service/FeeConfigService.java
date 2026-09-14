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
        updated.setId(1L); // đảm bảo luôn ghi đè đúng dòng duy nhất
        cached = repository.save(updated);
        return cached;
    }
}