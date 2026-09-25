package com.exe101.backend.service;

import com.exe101.backend.dto.apify.ApifyItemDetail;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ApifyXianyuService {

    private static final Pattern ID_PATTERN = Pattern.compile("[?&]id=(\\d+)");

    @Value("${apify.token:}") private String token;
    @Value("${apify.base-url:https://api.apify.com/v2}") private String baseUrl;
    @Value("${apify.actor-item-detail:zen-studio~goofish-xianyu-item-detail-scraper}") private String actorId;

    private final RestTemplate restTemplate = new org.springframework.boot.web.client.RestTemplateBuilder()
            .setConnectTimeout(java.time.Duration.ofSeconds(10)).setReadTimeout(java.time.Duration.ofSeconds(150)).build();

    public String extractItemId(String url) {
        if (url == null || url.length() > 2000) throw new IllegalArgumentException("Link không hợp lệ");
        java.net.URI uri = java.net.URI.create(url.trim());
        String host = uri.getHost();
        if (!("https".equalsIgnoreCase(uri.getScheme()) || "http".equalsIgnoreCase(uri.getScheme())) || host == null || uri.getUserInfo() != null)
            throw new IllegalArgumentException("Vui lòng nhập link http/https hợp lệ");
        host = host.toLowerCase(java.util.Locale.ROOT);
        if (!(host.equals("goofish.com") || host.endsWith(".goofish.com") || host.equals("2.taobao.com")))
            throw new IllegalArgumentException("Hiện chỉ phân tích link Xianyu (goofish.com). Taobao đang được tích hợp.");
        Matcher m = ID_PATTERN.matcher(uri.getRawQuery() == null ? "" : "?" + uri.getRawQuery());
        if (m.find()) return m.group(1);
        throw new IllegalArgumentException("Không tìm thấy item ID trong link: " + url);
    }

    public ApifyItemDetail fetchItemDetail(String itemId) {
        if (token.isBlank()) throw new IllegalStateException("Chưa cấu hình dịch vụ lấy dữ liệu sản phẩm");
        String endpoint = String.format("%s/acts/%s/run-sync-get-dataset-items", baseUrl, actorId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);
        Map<String, Object> body = Map.of("startUrls", List.of(itemId));

        JsonNode response = restTemplate.postForObject(
                endpoint, new HttpEntity<>(body, headers), JsonNode.class);

        if (response == null || !response.isArray() || response.isEmpty()) {
            throw new IllegalStateException("Apify không trả về dữ liệu cho item: " + itemId);
        }

        JsonNode item = response.get(0);
        if (!"ok".equals(item.path("rowStatus").asText())) {
            throw new IllegalStateException("Apify cào lỗi cho item " + itemId + ": " + item.path("detailError").asText());
        }

        return new ApifyItemDetail(item);
    }
}