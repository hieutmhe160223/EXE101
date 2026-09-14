package com.exe101.backend.controller;

import com.exe101.backend.model.FeeConfig;
import com.exe101.backend.service.FeeConfigService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/fee-config")
public class FeeConfigController {

    private final FeeConfigService feeConfigService;

    public FeeConfigController(FeeConfigService feeConfigService) {
        this.feeConfigService = feeConfigService;
    }

    @GetMapping
    public FeeConfig get() {
        return feeConfigService.getConfig();
    }

    @PutMapping
    public FeeConfig update(@RequestBody FeeConfig updated) {
        return feeConfigService.updateConfig(updated);
    }
}