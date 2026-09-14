package com.exe101.backend.dto;

public record LoginResponse(
        Long userId,
        String accessToken,
        String tokenType,
        String email,
        String fullName,
        String role,
        String phoneNumber
) {
}

