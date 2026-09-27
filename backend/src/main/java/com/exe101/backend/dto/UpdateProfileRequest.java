package com.exe101.backend.dto;

public record UpdateProfileRequest(
    @jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=150) String fullName,
    @jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Email String email,
    String dob,
    @jakarta.validation.constraints.Size(max=20) String phoneNumber
) {}
