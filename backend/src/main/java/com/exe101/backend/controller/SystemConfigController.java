package com.exe101.backend.controller;

import com.exe101.backend.dto.AdminDTO;
import com.exe101.backend.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SystemConfigController {

    private final SystemConfigService systemConfigService;

    @GetMapping
    public ResponseEntity<AdminDTO.SystemSettingsResponse> getSettings() {
        return ResponseEntity.ok(systemConfigService.getSettings());
    }
}
