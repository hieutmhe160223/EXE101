package com.exe101.backend.model;

public record UserAccount(
        String email,
        String passwordHash,
        String fullName,
        String role
) {
}

