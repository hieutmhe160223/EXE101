package com.exe101.backend.dto.apify;

import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ApifyItemDetail {

    private final JsonNode node;

    public ApifyItemDetail(JsonNode node) {
        this.node = node;
    }

    public String getId() { return text("id"); }
    public String getTitle() { return text("title"); }
    public String getDescription() { return text("description"); }
    public String getStatus() { return text("status"); } // "active" | "offline"
    public boolean isActive() {
        String s = getStatus();
        return "active".equalsIgnoreCase(s) || "published".equalsIgnoreCase(s);
    }

    public BigDecimal getPrice() {
        return node.has("price") ? BigDecimal.valueOf(node.get("price").asDouble()) : BigDecimal.ZERO;
    }

    public String getMainImageUrl() {
        for (JsonNode img : node.path("images")) {
            if (img.path("major").asBoolean(false)) return img.path("url").asText();
        }
        return node.path("pictureUrl").asText(null);
    }

    public List<String> getAllImageUrls() {
        List<String> urls = new ArrayList<>();
        for (JsonNode img : node.path("images")) urls.add(img.path("url").asText());
        return urls;
    }

    public String getSellerName() { return text("seller.name"); }

    public Integer getSellerCreditLevel() {
        JsonNode v = node.get("seller.creditLevel");
        return (v == null || v.isNull()) ? null : v.asInt();
    }

    public String getZhimaLevelCode() { return text("seller.zhimaLevelCode"); }
    public String getZhimaLevelName() { return text("seller.zhimaLevelName"); }
    public boolean isYxpPro() { return node.path("seller.yxpPro").asBoolean(false); }
    public boolean isZhimaVerified() { return node.path("seller.zhimaVerified").asBoolean(false); }

    public Integer getRegisteredDays() {
        String v = text("seller.registeredDays");
        return (v == null || v.isBlank()) ? null : Integer.valueOf(v);
    }

    public String getGoodReviewRate() { return text("seller.stats.goodReviewRate"); } // "99%"
    public Integer getGoodReviews() { return node.path("seller.stats.goodReviews").asInt(0); }
    public Integer getBadReviews() { return node.path("seller.stats.badReviews").asInt(0); }
    public String getReplyRate24h() { return text("seller.stats.replyRate24h"); }

    private String text(String key) {
        JsonNode v = node.get(key);
        return (v == null || v.isNull()) ? null : v.asText();
    }
}