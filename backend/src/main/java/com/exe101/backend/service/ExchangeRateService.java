package com.exe101.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class ExchangeRateService {

    @Value("${exchange-rate.api-url:https://open.er-api.com/v6/latest/CNY}") private String apiUrl;
    @Value("${exchange-rate.cache-ttl-minutes:60}") private long ttlMinutes;

    private final RestTemplate restTemplate = new org.springframework.boot.web.client.RestTemplateBuilder()
            .setConnectTimeout(java.time.Duration.ofSeconds(5)).setReadTimeout(java.time.Duration.ofSeconds(10)).build();

    public Instant getFetchedAt() { return cachedAt; }
    private BigDecimal cachedRate;
    private Instant cachedAt = Instant.EPOCH;

    public synchronized BigDecimal getCnyToVndRate() {
        if (cachedRate != null && Instant.now().isBefore(cachedAt.plus(ttlMinutes, ChronoUnit.MINUTES))) {
            return cachedRate;
        }

        JsonNode response = restTemplate.getForObject(apiUrl, JsonNode.class);
        double rate = response.path("rates").path("VND").asDouble();

        if (rate <= 0) {
            throw new IllegalStateException("Không lấy được tỷ giá CNY-VND hợp lệ");
        }

        cachedRate = BigDecimal.valueOf(rate);
        cachedAt = Instant.now();
        return cachedRate;
    }
}
