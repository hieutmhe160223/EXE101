package com.exe101.backend.service;
import com.exe101.backend.dto.apify.ApifyItemDetail;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.Duration;
import java.util.*;
@Service
public class ApifyTaobaoService {
    @Value("${apify.token:}") private String token;
    @Value("${apify.base-url:https://api.apify.com/v2}") private String base;
    @Value("${apify.actor-taobao-detail:zen-studio~taobao-detail-scraper}") private String actor;
    private final ObjectMapper mapper;
    private final RestTemplate http=new RestTemplateBuilder().setConnectTimeout(Duration.ofSeconds(10)).setReadTimeout(Duration.ofSeconds(150)).build();
    public ApifyTaobaoService(ObjectMapper mapper) { this.mapper=mapper; }
    public ApifyItemDetail fetch(String url) {
        if(token.isBlank()) throw new IllegalStateException("Chưa cấu hình dịch vụ lấy dữ liệu sản phẩm");
        HttpHeaders headers=new HttpHeaders(); headers.setContentType(MediaType.APPLICATION_JSON); headers.setBearerAuth(token);
        JsonNode rows=http.postForObject(base+"/acts/"+actor+"/run-sync-get-dataset-items",
                new HttpEntity<>(Map.of("items",List.of(url),"fetchReviews",false),headers),JsonNode.class);
        if(rows==null || !rows.isArray() || rows.isEmpty()) throw new IllegalStateException("Nguồn không trả sản phẩm Taobao");
        return normalize(rows.get(0));
    }
    public ApifyItemDetail normalize(JsonNode item) {
        if(item.path("itemId").asText().isBlank() || item.path("title").asText().isBlank())
            throw new IllegalStateException("Dữ liệu Taobao chưa đầy đủ");
        ObjectNode normalized=mapper.createObjectNode();
        normalized.put("id",item.path("itemId").asText());
        normalized.put("title",item.path("titleOriginal").asText(item.path("title").asText()));
        normalized.set("price",item.path("price"));
        normalized.put("status",!item.path("stock").isMissingNode() && !item.path("stock").isNull() && item.path("stock").asInt()==0 ? "offline" : "active");
        String html=item.path("descriptionHtml").asText("");
        String description=html.replaceAll("(?is)<(script|style)[^>]*>.*?</\\1>","").replaceAll("<[^>]+>"," ").replace("&nbsp;"," ").trim();
        normalized.put("description",description.isBlank() ? item.path("title").asText() : description);
        normalized.set("images",item.path("pictures")); normalized.put("pictureUrl",item.path("mainPictureUrl").asText(null));
        normalized.put("seller.name",item.path("shop").path("shopName").asText(null));
        normalized.set("variants",item.path("skus"));
        normalized.put("priceVerified",item.path("priceVerified").asBoolean(false));
        // Product reviews are not shop reputation: leave unavailable shop rating/count as null.
        return new ApifyItemDetail(normalized);
    }
}
