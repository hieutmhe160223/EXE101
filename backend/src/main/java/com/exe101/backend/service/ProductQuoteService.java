package com.exe101.backend.service;

import com.exe101.backend.dto.*;
import com.exe101.backend.dto.apify.ApifyItemDetail;
import com.exe101.backend.model.*;
import com.exe101.backend.repository.ProductQuoteRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProductQuoteService {

    private final ApifyXianyuService apifyService;
    private final TranslationService translationService;
    private final ExchangeRateService exchangeRateService;
    private final ShopLevelMapper shopLevelMapper;
    private final ProductQuoteRepository repository;
    private final FeeConfigService feeConfigService;

    private static final DateTimeFormatter DT_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public ProductQuoteService(ApifyXianyuService apifyService, TranslationService translationService,
                               ExchangeRateService exchangeRateService, ShopLevelMapper shopLevelMapper,
                               ProductQuoteRepository repository, FeeConfigService feeConfigService) {
        this.apifyService = apifyService;
        this.translationService = translationService;
        this.exchangeRateService = exchangeRateService;
        this.shopLevelMapper = shopLevelMapper;
        this.repository = repository;
        this.feeConfigService = feeConfigService;
    }

    public ProductQuoteResponse analyzeProductLink(String sourceUrl, UserAccount currentUser) {
        String itemId = apifyService.extractItemId(sourceUrl);
        long cacheTtlHours = feeConfigService.getConfig().getQuoteCacheTtlHours();

        return repository.findBySourceProductIdAndMarketplace(itemId, Marketplace.XIANYU)
                .filter(q -> q.getUpdatedAt().isAfter(LocalDateTime.now().minusHours(cacheTtlHours)))
                .map(this::toResponse)
                .orElseGet(() -> fetchAndBuild(sourceUrl, itemId, currentUser));
    }

    public ProductQuoteResponse getById(Long id) {
        ProductQuote quote = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy quote id=" + id));
        return toResponse(quote);
    }

    private ProductQuoteResponse fetchAndBuild(String sourceUrl, String itemId, UserAccount currentUser) {
        FeeConfig fee = feeConfigService.getConfig();

        ApifyItemDetail item = apifyService.fetchItemDetail(itemId);
        if (!item.isActive()) {
            throw new IllegalStateException("Sản phẩm đã hết hàng hoặc bị gỡ (status: " + item.getStatus() + ")");
        }

        String translatedName = translationService.translateToVietnamese(item.getTitle());
        String translatedDescription = translationService.translateToVietnamese(item.getDescription());
        BigDecimal rate = exchangeRateService.getCnyToVndRate();
        ShopLevel shopLevel = shopLevelMapper.map(item);

        BigDecimal productPriceCny = item.getPrice();
        BigDecimal serviceFeeCny = productPriceCny.multiply(fee.getServiceFeePercent()).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalCny = productPriceCny.add(fee.getDomesticShippingCny()).add(serviceFeeCny);
        BigDecimal totalVndFromCny = totalCny.multiply(rate);
        BigDecimal grandTotalVnd = totalVndFromCny.add(fee.getInternationalShippingVnd()).add(fee.getInsuranceVnd())
                .setScale(0, RoundingMode.HALF_UP);
        BigDecimal serviceFeeVnd = serviceFeeCny.multiply(rate).setScale(0, RoundingMode.HALF_UP);

        ProductQuote quote = new ProductQuote();
        quote.setCreatedBy(currentUser);
        quote.setMarketplace(Marketplace.XIANYU);
        quote.setSourceUrl(sourceUrl);
        quote.setSourceProductId(itemId);
        quote.setOriginalName(item.getTitle());
        quote.setTranslatedName(translatedName);
        quote.setImageUrl(item.getMainImageUrl());
        quote.setTranslatedDescription(translatedDescription);
        quote.setShopName(item.getSellerName());
        quote.setShopLevel(shopLevel);
        quote.setShopRating(reviewRateToStars(item.getGoodReviewRate()));
        quote.setProductPriceCny(productPriceCny);
        quote.setDomesticShippingFeeCny(fee.getDomesticShippingCny());
        quote.setServiceFeeVnd(serviceFeeVnd);
        quote.setInternationalShippingFeeVnd(fee.getInternationalShippingVnd());
        quote.setExchangeRate(rate);
        quote.setEstimatedTotalVnd(grandTotalVnd);

        ProductQuote saved = repository.save(quote);
        return toResponse(saved, item, totalCny);
    }

    private ProductQuoteResponse toResponse(ProductQuote q) {
        FeeConfig fee = feeConfigService.getConfig();

        ProductQuoteResponse res = new ProductQuoteResponse();
        res.setQuoteId(q.getId());
        res.setNameZh(q.getOriginalName());
        res.setNameVi(q.getTranslatedName());
        res.setDescriptionVi(q.getTranslatedDescription());
        res.setImages(List.of(q.getImageUrl()));
        res.setPriceCny(q.getProductPriceCny());
        res.setExchangeRate(q.getExchangeRate());
        res.setPriceVndEstimate(q.getProductPriceCny().multiply(q.getExchangeRate()).setScale(0, RoundingMode.HALF_UP));
        res.setSeller(new SellerInfoDto(q.getShopName(), q.getShopLevel(), q.getShopRating(), null));
        res.setGrandTotalVnd(q.getEstimatedTotalVnd());
        res.setDepositAmountVnd(q.getEstimatedTotalVnd().multiply(fee.getDepositPercent()).setScale(0, RoundingMode.HALF_UP));

        List<CostBreakdownItemDto> breakdown = new ArrayList<>();
        breakdown.add(new CostBreakdownItemDto("Giá sản phẩm", q.getProductPriceCny(), "¥"));
        breakdown.add(new CostBreakdownItemDto("Phí vận chuyển nội địa TQ", q.getDomesticShippingFeeCny(), "¥"));
        breakdown.add(new CostBreakdownItemDto("Phí dịch vụ", q.getServiceFeeVnd(), "₫"));
        breakdown.add(new CostBreakdownItemDto("Phí vận chuyển quốc tế", q.getInternationalShippingFeeVnd(), "₫"));
        res.setCostBreakdown(breakdown);
        res.setExchangeRateUpdatedAt(LocalDateTime.now().format(DT_FMT));
        return res;
    }

    private ProductQuoteResponse toResponse(ProductQuote q, ApifyItemDetail item, BigDecimal totalCny) {
        ProductQuoteResponse res = toResponse(q);
        res.setImages(item.getAllImageUrls());
        res.setTotalCny(totalCny);
        int reviews = (item.getGoodReviews() == null ? 0 : item.getGoodReviews())
                + (item.getBadReviews() == null ? 0 : item.getBadReviews());
        res.setSeller(new SellerInfoDto(item.getSellerName(), q.getShopLevel(), q.getShopRating(), reviews));
        return res;
    }

    private BigDecimal reviewRateToStars(String goodReviewRatePercent) {
        if (goodReviewRatePercent == null || goodReviewRatePercent.isBlank()) return null;
        double pct = Double.parseDouble(goodReviewRatePercent.replace("%", "").trim());
        return BigDecimal.valueOf(pct / 20.0).setScale(2, RoundingMode.HALF_UP);
    }
}