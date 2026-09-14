package com.exe101.backend.dto;

import com.exe101.backend.model.ShopLevel;
import java.math.BigDecimal;

public class SellerInfoDto {
    private String name;
    private ShopLevel level;
    private BigDecimal rating;   // 0-5, quy đổi từ goodReviewRate
    private Integer reviews;     // tổng good+bad reviews

    public SellerInfoDto(String name, ShopLevel level, BigDecimal rating, Integer reviews) {
        this.name = name; this.level = level; this.rating = rating; this.reviews = reviews;
    }
    public String getName() { return name; }
    public ShopLevel getLevel() { return level; }
    public BigDecimal getRating() { return rating; }
    public Integer getReviews() { return reviews; }
}