package com.exe101.backend.repository;

import com.exe101.backend.model.ProductQuote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductQuoteRepository extends JpaRepository<ProductQuote, Long> {}