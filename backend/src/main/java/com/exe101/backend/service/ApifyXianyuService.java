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

    @Value("${apify.token}") private String token;
    @Value("${apify.base-url}") private String baseUrl;
    @Value("${apify.actor-item-detail}") private String actorId;

    private final RestTemplate restTemplate = new RestTemplate();

    public String extractItemId(String url) {
        Matcher m = ID_PATTERN.matcher(url);
        if (m.find()) return m.group(1);
        throw new IllegalArgumentException("Không tìm thấy item ID trong link: " + url);
    }

    public ApifyItemDetail fetchItemDetail(String itemId) {
        String endpoint = String.format("%s/acts/%s/run-sync-get-dataset-items?token=%s",
                baseUrl, actorId, token);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
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