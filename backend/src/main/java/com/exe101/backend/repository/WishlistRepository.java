package com.exe101.backend.repository;

import com.exe101.backend.model.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<WishlistItem, Long> {

    Optional<WishlistItem> findByUserIdAndProductQuoteId(Long userId, Long productQuoteId);

    List<WishlistItem> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByUserIdAndProductQuoteId(Long userId, Long productQuoteId);

    @Modifying
    @Query("DELETE FROM WishlistItem w WHERE w.user.id = :userId AND w.productQuote.id = :productQuoteId")
    void deleteByUserIdAndProductQuoteId(@Param("userId") Long userId, @Param("productQuoteId") Long productQuoteId);
}
