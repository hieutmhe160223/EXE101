package com.exe101.backend.dto;

public record UpdateProfileRequest(
    String fullName,
    String email,
    String dob,
    String phoneNumber
) {}