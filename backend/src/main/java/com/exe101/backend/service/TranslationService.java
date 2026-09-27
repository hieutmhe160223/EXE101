package com.exe101.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class TranslationService {

    @Value("${rapidapi.key:}") private String rapidApiKey;
    @Value("${rapidapi.translate.host:google-api31.p.rapidapi.com}") private String rapidApiHost;
    @Value("${rapidapi.translate.url:https://google-api31.p.rapidapi.com/gtranslate}") private String translateUrl;

    private final RestTemplate restTemplate = new org.springframework.boot.web.client.RestTemplateBuilder()
            .setConnectTimeout(java.time.Duration.ofSeconds(5)).setReadTimeout(java.time.Duration.ofSeconds(20)).build();

    public String translateToVietnamese(String text) {
        if (text == null || text.isBlank() || rapidApiKey.isBlank()) return text;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-rapidapi-host", rapidApiHost);
        headers.set("x-rapidapi-key", rapidApiKey);

        Map<String, String> body = Map.of(
                "text", text,
                "to", "vi",
                "from_lang", "zh"
        );

        try {
            JsonNode response = restTemplate.postForObject(
                    translateUrl, new HttpEntity<>(body, headers), JsonNode.class);
            return response.path("translated_text").asText(text);
        } catch (Exception e) {
            // Fallback: giữ nguyên bản gốc nếu API lỗi, không chặn cả flow phân tích sản phẩm
            return text;
        }
    }
}
