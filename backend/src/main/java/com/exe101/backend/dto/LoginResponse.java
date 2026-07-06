package com.exe101.backend.dto;

public record LoginResponse(
        String accessToken,
        String tokenType,
        Long id,
        String email,
        String fullName,
        String role,
        String phoneNumber,
        String dob
) {
}

