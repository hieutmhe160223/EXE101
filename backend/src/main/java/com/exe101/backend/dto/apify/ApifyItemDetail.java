package com.exe101.backend.dto.apify;
import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.util.*;
public class ApifyItemDetail {
    private final JsonNode node;
    public ApifyItemDetail(JsonNode node) { this.node = node; }
    private JsonNode field(String key) {
        if (node.has(key)) return node.path(key);
        JsonNode value = node;
        for (String part : key.split("\\.")) value = value.path(part);
        return value;
    }
    private String text(String key) {
        var value = field(key); return value.isMissingNode() || value.isNull() ? null : value.asText();
    }
    private Integer integer(String key) {
        String value = text(key); if (value == null) return null;
        try { return Integer.valueOf(value); } catch (NumberFormatException ex) { return null; }
    }
    public String getId() { return text("id"); }
    public String getTitle() { return text("title"); }
    public String getDescription() { return text("description"); }
    public String getStatus() { return text("status"); }
    public boolean isActive() { return "active".equalsIgnoreCase(getStatus()) || "published".equalsIgnoreCase(getStatus()); }
    public BigDecimal getPrice() {
        try { return new BigDecimal(Objects.requireNonNullElse(text("price"), "0")); }
        catch (NumberFormatException ex) { return BigDecimal.ZERO; }
    }
    public String getMainImageUrl() {
        for (JsonNode img : node.path("images")) if (img.path("major").asBoolean()) return img.path("url").asText(null);
        var urls = getAllImageUrls(); return urls.isEmpty() ? text("pictureUrl") : urls.get(0);
    }
    public List<String> getAllImageUrls() {
        List<String> urls = new ArrayList<>();
        for (JsonNode img : node.path("images")) {
            String url = img.isTextual() ? img.asText() : img.path("url").asText(null);
            if (url != null && !url.isBlank()) urls.add(url);
        }
        return urls;
    }
    public String getSellerName() { return text("seller.name"); }
    public Integer getSellerCreditLevel() { return integer("seller.creditLevel"); }
    public String getZhimaLevelCode() { return text("seller.zhimaLevelCode"); }
    public String getZhimaLevelName() { return text("seller.zhimaLevelName"); }
    public boolean isYxpPro() { return field("seller.yxpPro").asBoolean(false); }
    public boolean isZhimaVerified() { return field("seller.zhimaVerified").asBoolean(false); }
    public Integer getRegisteredDays() { return integer("seller.registeredDays"); }
    public String getGoodReviewRate() { return text("seller.stats.goodReviewRate"); }
    public Integer getGoodReviews() { return integer("seller.stats.goodReviews"); }
    public Integer getBadReviews() { return integer("seller.stats.badReviews"); }
    public Boolean getPriceVerified() { return field("priceVerified").isMissingNode() ? null : field("priceVerified").asBoolean(); }
    public java.util.List<com.exe101.backend.model.ProductVariant> getVariants() {
        var result = new java.util.ArrayList<com.exe101.backend.model.ProductVariant>();
        for (JsonNode sku : node.path("variants")) {
            try {
                String id = sku.path("skuId").asText();
                BigDecimal price = new BigDecimal(sku.path("price").asText());
                Integer stock = sku.path("quantity").isNull() || sku.path("quantity").isMissingNode() ? null : sku.path("quantity").asInt();
                if (!id.isBlank() && price.signum() > 0) result.add(new com.exe101.backend.model.ProductVariant(id, sku.path("propsNames").asText(id), price, stock));
            } catch (NumberFormatException ignored) { }
        }
        return result;
    }
    public String getReplyRate24h() { return text("seller.stats.replyRate24h"); }
}
