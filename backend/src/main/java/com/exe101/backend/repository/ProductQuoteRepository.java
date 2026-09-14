package com.exe101.backend.repository;

import com.exe101.backend.model.Marketplace;
import com.exe101.backend.model.ProductQuote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductQuoteRepository extends JpaRepository<ProductQuote, Long> {
    Optional<ProductQuote> findBySourceProductIdAndMarketplace(String sourceProductId, Marketplace marketplace);
}