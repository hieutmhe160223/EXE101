package com.exe101.backend.service;

import com.exe101.backend.dto.*;
import com.exe101.backend.model.*;
import org.springframework.stereotype.Service;
import java.math.*;
import java.util.List;

/** One calculation for product preview, checkout and persisted orders. Shipping/insurance are per order. */
@Service
public class PricingService {
    private final FeeConfigService fees;
    public PricingService(FeeConfigService fees) { this.fees = fees; }
    public PricePreviewResponse calculate(ProductQuote quote, int quantity) { return calculate(quote, quantity, null); }
    public PricePreviewResponse calculate(ProductQuote quote, int quantity, String variant) {
        if (quantity < 1 || quantity > 100) throw new IllegalArgumentException("Số lượng phải từ 1 đến 100");
        BigDecimal rate = quote.getExchangeRate();
        if (rate == null || rate.signum() <= 0 || quote.getProductPriceCny() == null || quote.getProductPriceCny().signum() <= 0)
            throw new IllegalStateException("Báo giá chưa có giá hoặc tỷ giá hợp lệ. Vui lòng phân tích lại link.");
        BigDecimal count = BigDecimal.valueOf(quantity);
        BigDecimal unitPrice = quote.getProductPriceCny();
        if (quote.getVariants() != null && !quote.getVariants().isEmpty()) {
            ProductVariant selected = variant == null || variant.isBlank() ? quote.getVariants().stream().filter(v -> v.getStock() == null || v.getStock() > 0).findFirst().orElseThrow(() -> new IllegalStateException("Tất cả phân loại đã hết hàng")) : quote.getVariants().stream()
                    .filter(v -> v.getVariantId().equals(variant)).findFirst().orElseThrow(() -> new IllegalArgumentException("Phân loại không hợp lệ"));
            if (selected.getStock() != null && quantity > selected.getStock()) throw new IllegalStateException("Số lượng vượt quá tồn kho của phân loại");
            unitPrice = selected.getPriceCny();
        } else if (variant != null && !variant.isBlank()) throw new IllegalArgumentException("Sản phẩm không có phân loại này");
        BigDecimal product = unitPrice.multiply(count);
        BigDecimal domestic = zero(quote.getDomesticShippingFeeCny());
        BigDecimal service = quote.getServiceFeePercent() == null ? money(zero(quote.getServiceFeeVnd()).multiply(count))
                : money(product.multiply(rate).multiply(quote.getServiceFeePercent()));
        BigDecimal shipping = money(zero(quote.getInternationalShippingFeeVnd()));
        BigDecimal insurance = money(quote.getInsuranceFeeVnd() == null ? fees.getConfig().getInsuranceVnd() : quote.getInsuranceFeeVnd());
        BigDecimal percent = quote.getDepositPercent() == null ? fees.getConfig().getDepositPercent() : quote.getDepositPercent();
        if (percent.signum() <= 0 || percent.compareTo(BigDecimal.ONE) > 0) throw new IllegalStateException("Tỷ lệ cọc không hợp lệ");
        BigDecimal productVnd = money(product.multiply(rate));
        BigDecimal domesticVnd = money(domestic.multiply(rate));
        BigDecimal total = productVnd.add(domesticVnd).add(service).add(shipping).add(insurance);
        BigDecimal deposit = money(total.multiply(percent));
        return new PricePreviewResponse(quantity, product, domestic, service, shipping, insurance, rate,
                total.divide(rate, 2, RoundingMode.HALF_UP), total, deposit, total.subtract(deposit), percent,
                List.of(new CostBreakdownItemDto("Tiền hàng", productVnd, "₫"),
                        new CostBreakdownItemDto("Vận chuyển nội địa TQ (mỗi đơn)", domesticVnd, "₫"),
                        new CostBreakdownItemDto("Phí dịch vụ", service, "₫"),
                        new CostBreakdownItemDto("Vận chuyển quốc tế ước tính (mỗi đơn)", shipping, "₫"),
                        new CostBreakdownItemDto("Bảo hiểm (mỗi đơn)", insurance, "₫")));
    }
    private BigDecimal zero(BigDecimal value) { return value == null ? BigDecimal.ZERO : value; }
    private BigDecimal money(BigDecimal value) { return value.setScale(0, RoundingMode.HALF_UP); }
}
