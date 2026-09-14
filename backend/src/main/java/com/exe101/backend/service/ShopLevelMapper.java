package com.exe101.backend.service;

import com.exe101.backend.dto.apify.ApifyItemDetail;
import com.exe101.backend.model.ShopLevel;
import org.springframework.stereotype.Component;

@Component
public class ShopLevelMapper {

    public ShopLevel map(ApifyItemDetail item) {
        if (item.getSellerCreditLevel() == null) return ShopLevel.UNKNOWN;

        if (item.isYxpPro()) return ShopLevel.PRO;

        double goodRate = parsePercent(item.getGoodReviewRate());
        int registeredDays = item.getRegisteredDays() == null ? 0 : item.getRegisteredDays();
        String zhima = item.getZhimaLevelCode();

        int score = 0;
        score += zhimaScore(zhima);
        score += goodRate >= 99 ? 3 : goodRate >= 95 ? 2 : goodRate >= 90 ? 1 : 0;
        score += registeredDays >= 1000 ? 2 : registeredDays >= 365 ? 1 : 0;
        score += item.isZhimaVerified() ? 1 : 0;

        return switch (Math.min(score, 7)) {
            case 7 -> ShopLevel.L7;
            case 6 -> ShopLevel.L6;
            case 5 -> ShopLevel.L5;
            case 4 -> ShopLevel.L4;
            case 3 -> ShopLevel.L3;
            case 2 -> ShopLevel.L2;
            case 1 -> ShopLevel.L1;
            default -> ShopLevel.UNKNOWN;
        };
    }

    private int zhimaScore(String code) {
        if (code == null) return 0;
        return switch (code) {
            case "AAA" -> 3;
            case "AA" -> 2;
            case "A" -> 1;
            default -> 0;
        };
    }

    private double parsePercent(String s) {
        if (s == null || s.isBlank()) return 0;
        return Double.parseDouble(s.replace("%", "").trim());
    }
}