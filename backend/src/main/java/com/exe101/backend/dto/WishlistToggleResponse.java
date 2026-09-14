package com.exe101.backend.dto;

public record WishlistToggleResponse(
        boolean inWishlist,
        String message
) {}
