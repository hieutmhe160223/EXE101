package com.exe101.backend.controller;

import com.exe101.backend.dto.WishlistItemResponse;
import com.exe101.backend.dto.WishlistRequest;
import com.exe101.backend.dto.WishlistToggleResponse;
import com.exe101.backend.service.WishlistService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/wishlist")

public class WishlistController {

    private final WishlistService wishlistService;
    private final com.exe101.backend.service.CurrentUser currentUser;

    public WishlistController(WishlistService wishlistService, com.exe101.backend.service.CurrentUser currentUser) {
        this.currentUser = currentUser;
        this.wishlistService = wishlistService;
    }

    @PostMapping("/toggle")
    public ResponseEntity<WishlistToggleResponse> toggleWishlist(@Valid @RequestBody WishlistRequest request) {
        currentUser.requireId(request.userId());
        WishlistToggleResponse response = wishlistService.toggleWishlist(
                request.userId(),
                request.productQuoteId()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Void> addToWishlist(@Valid @RequestBody WishlistRequest request) {
        currentUser.requireId(request.userId());
        wishlistService.addToWishlist(request.userId(), request.productQuoteId());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{productQuoteId}")
    public ResponseEntity<Void> removeFromWishlist(
            @PathVariable Long productQuoteId,
            @RequestParam @NotNull Long userId
    ) {
        currentUser.requireId(userId);
        wishlistService.removeFromWishlist(userId, productQuoteId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check/{productQuoteId}")
    public ResponseEntity<Boolean> checkWishlist(
            @PathVariable Long productQuoteId,
            @RequestParam @NotNull Long userId
    ) {
        currentUser.requireId(userId);
        boolean inWishlist = wishlistService.isInWishlist(userId, productQuoteId);
        return ResponseEntity.ok(inWishlist);
    }

    @GetMapping
    public ResponseEntity<List<WishlistItemResponse>> getWishlist(@RequestParam @NotNull Long userId) {
        currentUser.requireId(userId);
        List<WishlistItemResponse> wishlist = wishlistService.getWishlist(userId);
        return ResponseEntity.ok(wishlist);
    }
}
