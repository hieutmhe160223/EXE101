package com.exe101.backend.service;

import com.exe101.backend.dto.AdminDTO;
import com.exe101.backend.model.ExchangeRateConfig;
import com.exe101.backend.model.ServiceFeeConfig;
import com.exe101.backend.repository.ExchangeRateConfigRepository;
import com.exe101.backend.repository.ServiceFeeConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class SystemConfigService {

    private static final String CNY_VND = "CNYVND";
    private static final String SERVICE_MIN = "ORDER_SERVICE_MIN_PERCENT";
    private static final String SERVICE_MAX = "ORDER_SERVICE_MAX_PERCENT";
    private static final String DOMESTIC_SHIPPING = "DOMESTIC_SHIPPING_BASE";
    private static final String INTERNATIONAL_SHIPPING = "INTERNATIONAL_SHIPPING_BASE";

    private final ExchangeRateConfigRepository exchangeRateRepository;
    private final ServiceFeeConfigRepository serviceFeeRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String EXCHANGE_RATE_API = "https://open.er-api.com/v6/latest/CNY";

    @Transactional(readOnly = true)
    public AdminDTO.SystemSettingsResponse getSettings() {
        ExchangeRateConfig exchangeRate = exchangeRateRepository.findByCurrencyPair(CNY_VND)
                .orElseThrow(() -> new IllegalStateException("Chưa cấu hình tỷ giá CNY/VND"));
        return new AdminDTO.SystemSettingsResponse(
                exchangeRate.getRate(),
                getFee(SERVICE_MIN).getValue(),
                getFee(SERVICE_MAX).getValue(),
                getFee(DOMESTIC_SHIPPING).getValue(),
                getFee(INTERNATIONAL_SHIPPING).getValue(),
                exchangeRate.getUpdatedAt()
        );
    }

    @Transactional
    public AdminDTO.SystemSettingsResponse updateSettings(AdminDTO.UpdateSystemSettingsRequest request) {
        validate(request);
        ExchangeRateConfig exchangeRate = exchangeRateRepository.findByCurrencyPair(CNY_VND)
                .orElseGet(() -> exchangeRateRepository.save(new ExchangeRateConfig(CNY_VND, request.exchangeRate())));
        exchangeRate.updateRate(request.exchangeRate());
        exchangeRateRepository.save(exchangeRate);

        updateFee(SERVICE_MIN, request.serviceFeeMinPercent());
        updateFee(SERVICE_MAX, request.serviceFeeMaxPercent());
        updateFee(DOMESTIC_SHIPPING, request.domesticShippingCny());
        updateFee(INTERNATIONAL_SHIPPING, request.internationalShippingVnd());
        return getSettings();
    }

    @Transactional
    public AdminDTO.SystemSettingsResponse refreshExchangeRate() {
        try {
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> response = restTemplate.getForObject(EXCHANGE_RATE_API, java.util.Map.class);
            Object ratesValue = response == null ? null : response.get("rates");
            if (!(ratesValue instanceof java.util.Map<?, ?> rates)) {
                throw new IllegalStateException("API tỷ giá không trả về dữ liệu rates");
            }
            Object vndValue = rates.get("VND");
            BigDecimal rate = vndValue == null ? null : new BigDecimal(vndValue.toString());
            if (rate == null || rate.signum() <= 0) {
                throw new IllegalStateException("API tỷ giá không trả về CNY/VND hợp lệ");
            }
            ExchangeRateConfig exchangeRate = exchangeRateRepository.findByCurrencyPair(CNY_VND)
                    .orElseGet(() -> new ExchangeRateConfig(CNY_VND, rate));
            exchangeRate.updateRate(rate);
            exchangeRateRepository.save(exchangeRate);
            return getSettings();
        } catch (Exception exception) {
            throw new IllegalStateException("Không thể cập nhật tỷ giá tự động", exception);
        }
    }

    @Scheduled(fixedDelayString = "${app.exchange-rate.refresh-ms:1800000}", initialDelayString = "${app.exchange-rate.initial-delay-ms:10000}")
    public void refreshExchangeRateAutomatically() {
        try {
            refreshExchangeRate();
        } catch (Exception exception) {
            System.err.println("Không thể tự động cập nhật tỷ giá CNY/VND: " + exception.getMessage());
        }
    }

    private ServiceFeeConfig getFee(String code) {
        return serviceFeeRepository.findByFeeCode(code)
                .orElseThrow(() -> new IllegalStateException("Chưa cấu hình phí: " + code));
    }

    private void updateFee(String code, BigDecimal value) {
        ServiceFeeConfig fee = getFee(code);
        fee.updateValue(value);
        serviceFeeRepository.save(fee);
    }

    private void validate(AdminDTO.UpdateSystemSettingsRequest request) {
        if (request == null || request.exchangeRate() == null || request.exchangeRate().signum() <= 0
                || request.serviceFeeMinPercent() == null || request.serviceFeeMinPercent().signum() < 0
                || request.serviceFeeMaxPercent() == null || request.serviceFeeMaxPercent().signum() < 0
                || request.serviceFeeMinPercent().compareTo(request.serviceFeeMaxPercent()) > 0
                || request.domesticShippingCny() == null || request.domesticShippingCny().signum() < 0
                || request.internationalShippingVnd() == null || request.internationalShippingVnd().signum() < 0) {
            throw new IllegalArgumentException("Giá trị cấu hình không hợp lệ");
        }
    }
}
