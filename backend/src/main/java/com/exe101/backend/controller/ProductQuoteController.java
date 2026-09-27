package com.exe101.backend.controller;

import com.exe101.backend.dto.ProductQuoteRequest;
import com.exe101.backend.service.ProductQuoteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/quotes")

public class ProductQuoteController {

    private final ProductQuoteService productQuoteService;
    private final com.exe101.backend.service.ExchangeRateService rates;

    public ProductQuoteController(ProductQuoteService productQuoteService, com.exe101.backend.service.ExchangeRateService rates) {
        this.rates = rates;
        this.productQuoteService = productQuoteService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyze(@RequestBody ProductQuoteRequest request) {
        try {
            return ResponseEntity.ok(productQuoteService.analyzeProductLink(request.getUrl(), null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Đã có lỗi xảy ra, vui lòng thử lại"));
        }
    }

    @GetMapping("/exchange-rate")
    public Object exchangeRate() { var rate = rates.getCnyToVndRate(); return Map.of("rate", rate, "updatedAt", rates.getFetchedAt()); }

    @GetMapping("/{id}/similar-products")
    public Object similar(@PathVariable Long id) { return productQuoteService.similar(id); }

    @GetMapping("/{id}/price-preview")
    public Object preview(@PathVariable Long id, @RequestParam(defaultValue = "1") int quantity, @RequestParam(required = false) String variant) {
        return productQuoteService.preview(id, quantity, variant);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(productQuoteService.getById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}