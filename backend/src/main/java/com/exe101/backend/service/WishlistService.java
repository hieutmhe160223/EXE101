package com.exe101.backend.service;

import com.exe101.backend.dto.WishlistItemResponse;
import com.exe101.backend.dto.WishlistToggleResponse;
import com.exe101.backend.model.ProductQuote;
import com.exe101.backend.model.UserAccount;
import com.exe101.backend.model.WishlistItem;
import com.exe101.backend.repository.ProductQuoteRepository;
import com.exe101.backend.repository.UserAccountRepository;
import com.exe101.backend.repository.WishlistRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductQuoteRepository productQuoteRepository;
    private final UserAccountRepository userAccountRepository;

    public WishlistService(
            WishlistRepository wishlistRepository,
            ProductQuoteRepository productQuoteRepository,
            UserAccountRepository userAccountRepository
    ) {
        this.wishlistRepository = wishlistRepository;
        this.productQuoteRepository = productQuoteRepository;
        this.userAccountRepository = userAccountRepository;
    }

    @Transactional
    public WishlistToggleResponse toggleWishlist(Long userId, Long productQuoteId) {
        // Check if already in wishlist
        boolean exists = wishlistRepository.existsByUserIdAndProductQuoteId(userId, productQuoteId);

        if (exists) {
            // Remove from wishlist
            wishlistRepository.deleteByUserIdAndProductQuoteId(userId, productQuoteId);
            return new WishlistToggleResponse(false, "Đã xóa khỏi danh sách yêu thích");
        } else {
            // Add to wishlist
            addToWishlist(userId, productQuoteId);
            return new WishlistToggleResponse(true, "Đã thêm vào danh sách yêu thích");
        }
    }

    @Transactional
    public void addToWishlist(Long userId, Long productQuoteId) {
        // Fetch user
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        // Fetch product quote
        ProductQuote productQuote = productQuoteRepository.findById(productQuoteId)
                .orElseThrow(() -> new EntityNotFoundException("ProductQuote not found with id: " + productQuoteId));

        // Check if already exists (avoid duplicate)
        if (wishlistRepository.existsByUserIdAndProductQuoteId(userId, productQuoteId)) {
            return; // Already in wishlist, do nothing
        }

        // Create new wishlist item
        WishlistItem wishlistItem = new WishlistItem(user, productQuote);
        wishlistRepository.save(wishlistItem);
    }

    @Transactional
    public void removeFromWishlist(Long userId, Long productQuoteId) {
        wishlistRepository.deleteByUserIdAndProductQuoteId(userId, productQuoteId);
    }

    @Transactional(readOnly = true)
    public boolean isInWishlist(Long userId, Long productQuoteId) {
        return wishlistRepository.existsByUserIdAndProductQuoteId(userId, productQuoteId);
    }

    @Transactional(readOnly = true)
    public List<WishlistItemResponse> getWishlist(Long userId) {
        List<WishlistItem> items = wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return items.stream()
                .map(this::toResponse)
                .toList();
    }

    private WishlistItemResponse toResponse(WishlistItem item) {
        ProductQuote quote = item.getProductQuote();
        BigDecimal priceVndEstimate = quote.getProductPriceCny()
                .multiply(quote.getExchangeRate())
                .setScale(0, RoundingMode.HALF_UP);

        return new WishlistItemResponse(
                item.getId(),
                quote.getId(),
                quote.getOriginalName(),
                quote.getTranslatedName(),
                quote.getImageUrl(),
                quote.getProductPriceCny(),
                priceVndEstimate,
                quote.getExchangeRate(),
                item.getCreatedAt()
        );
    }
}
