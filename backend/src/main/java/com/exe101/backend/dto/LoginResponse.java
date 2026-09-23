package com.exe101.backend.dto;

import com.exe101.backend.model.Role;

public record LoginResponse(
        String accessToken,
        String tokenType,
        Long id,
        String email,
        String fullName,
        Role role,
        String phoneNumber,
        String dob
) {
}

