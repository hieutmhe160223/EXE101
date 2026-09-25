package com.exe101.backend.service;

import com.exe101.backend.dto.*;
import com.exe101.backend.dto.apify.ApifyItemDetail;
import com.exe101.backend.model.*;
import com.exe101.backend.repository.ProductQuoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.*;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ProductQuoteService {
    private final ApifyXianyuService apifyService;
    private final TranslationService translation;
    private final ExchangeRateService rates;
    private final ShopLevelMapper levels;
    private final ProductQuoteRepository repository;
    private final FeeConfigService fees;
    private final PricingService pricing;
    private final ApifyTaobaoService taobao;
    public ProductQuoteService(ApifyXianyuService apifyService, TranslationService translation,
            ExchangeRateService rates, ShopLevelMapper levels, ProductQuoteRepository repository,
            FeeConfigService fees, PricingService pricing, ApifyTaobaoService taobao) {
        this.apifyService = apifyService; this.translation = translation; this.rates = rates;
        this.levels = levels; this.repository = repository; this.fees = fees; this.pricing = pricing; this.taobao = taobao;
    }
    @Transactional
    public ProductQuoteResponse analyzeProductLink(String url, UserAccount user) {
        var link = MarketplaceLink.parse(url);
        String id = link.id();
        var existing = id == null ? repository.findFirstBySourceUrlOrderByUpdatedAtDesc(link.url()) : repository.findFirstBySourceProductIdAndMarketplaceOrderByUpdatedAtDesc(id, link.marketplace());
        if (existing.filter(q -> q.getExpiresAt() != null && q.getExpiresAt().isAfter(LocalDateTime.now())).isPresent())
            return toResponse(existing.get());
        ApifyItemDetail item = link.marketplace() == Marketplace.XIANYU ? apifyService.fetchItemDetail(id) : taobao.fetch(link.url());
        if (id == null) {
            id = item.getId();
            existing = repository.findFirstBySourceProductIdAndMarketplaceOrderByUpdatedAtDesc(id, link.marketplace());
        }
        if (!item.isActive()) throw new IllegalStateException("Sản phẩm đã hết hàng hoặc bị gỡ");
        if (item.getPrice() == null || item.getPrice().signum() <= 0) throw new IllegalStateException("Nguồn chưa trả giá hợp lệ");
        FeeConfig fee = fees.getConfig();
        ProductQuote q = existing.orElseGet(ProductQuote::new);
        String name = translation.translateToVietnamese(item.getTitle());
        String description = translation.translateToVietnamese(item.getDescription());
        q.setCreatedBy(user); q.setMarketplace(link.marketplace());
        q.setSourceUrl(link.url()); q.setSourceProductId(id); q.setOriginalName(item.getTitle());
        q.setTranslatedName(name); q.setTranslatedDescription(description);
        q.setTranslationComplete(!Objects.equals(name, item.getTitle())
                && (item.getDescription() == null || item.getDescription().isBlank() || !Objects.equals(description, item.getDescription())));
        List<String> images = item.getAllImageUrls().stream().filter(Objects::nonNull).filter(s -> !s.isBlank()).distinct().toList();
        if (images.isEmpty() && item.getMainImageUrl() != null) images = List.of(item.getMainImageUrl());
        q.setImageUrls(new ArrayList<>(images)); q.setImageUrl(images.isEmpty() ? null : images.get(0));
        q.setVariants(new ArrayList<>(item.getVariants())); q.setSourcePriceVerified(item.getPriceVerified());
        q.setServiceFeePercent(fee.getServiceFeePercent());
        q.setShopName(item.getSellerName()); q.setShopLevel(levels.map(item));
        q.setShopRating(reviewStars(item.getGoodReviewRate()));
        q.setShopReviewCount(item.getGoodReviews() == null && item.getBadReviews() == null ? null :
                Objects.requireNonNullElse(item.getGoodReviews(), 0) + Objects.requireNonNullElse(item.getBadReviews(), 0));
        BigDecimal rate = rates.getCnyToVndRate();
        q.setProductPriceCny(item.getPrice()); q.setExchangeRate(rate);
        q.setExchangeRateFetchedAt(LocalDateTime.ofInstant(rates.getFetchedAt(), ZoneId.systemDefault()));
        q.setDomesticShippingFeeCny(fee.getDomesticShippingCny());
        q.setServiceFeeVnd(item.getPrice().multiply(fee.getServiceFeePercent()).multiply(rate).setScale(0, RoundingMode.HALF_UP));
        q.setInternationalShippingFeeVnd(fee.getInternationalShippingVnd());
        q.setInsuranceFeeVnd(fee.getInsuranceVnd()); q.setDepositPercent(fee.getDepositPercent());
        q.setExpiresAt(LocalDateTime.now().plusHours(fee.getQuoteCacheTtlHours()));
        q.setEstimatedTotalVnd(pricing.calculate(q, 1).grandTotalVnd());
        return toResponse(repository.save(q));
    }
    @Transactional(readOnly = true)
    public ProductQuoteResponse getById(Long id) { return toResponse(find(id)); }
    @Transactional(readOnly = true)
    public PricePreviewResponse preview(Long id, int quantity, String variant) { return pricing.calculate(find(id), quantity, variant); }
    @Transactional(readOnly = true)
    public List<ProductQuoteResponse> similar(Long id) {
        ProductQuote source = find(id);
        Set<String> words = keywords(source.getTranslatedName());
        if (words.isEmpty()) return List.of();
        return repository.findTop100ByOrderByUpdatedAtDesc().stream()
                .filter(q -> !q.getId().equals(id) && q.getExpiresAt() != null && q.getExpiresAt().isAfter(LocalDateTime.now()))
                .filter(q -> q.getProductPriceCny() != null && q.getProductPriceCny().compareTo(source.getProductPriceCny().multiply(new BigDecimal("0.5"))) >= 0
                        && q.getProductPriceCny().compareTo(source.getProductPriceCny().multiply(new BigDecimal("2"))) <= 0)
                .filter(q -> keywords(q.getTranslatedName()).stream().anyMatch(words::contains))
                .limit(4).map(this::toResponse).toList();
    }
    private Set<String> keywords(String title) {
        if (title == null) return Set.of();
        var stop = Set.of("sản", "phẩm", "cho", "của", "hàng", "mới", "với");
        return Arrays.stream(title.toLowerCase(Locale.ROOT).split("[^\\p{L}\\p{N}]+")).filter(s -> s.length() >= 3 && !stop.contains(s)).collect(java.util.stream.Collectors.toSet());
    }
    private ProductQuote find(Long id) {
        return repository.findById(id).orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Không tìm thấy báo giá"));
    }
    private ProductQuoteResponse toResponse(ProductQuote q) {
        var price = pricing.calculate(q, 1);
        ProductQuoteResponse res = new ProductQuoteResponse();
        res.setVariants(List.copyOf(q.getVariants())); res.setSourcePriceVerified(q.getSourcePriceVerified());
        res.setQuoteId(q.getId()); res.setNameZh(q.getOriginalName()); res.setNameVi(q.getTranslatedName());
        res.setDescriptionVi(q.getTranslatedDescription());
        var images = q.getImageUrls();
        res.setImages(images == null || images.isEmpty() ? (q.getImageUrl() == null ? List.of() : List.of(q.getImageUrl())) : List.copyOf(images));
        res.setPriceCny(q.getProductPriceCny()); res.setExchangeRate(q.getExchangeRate());
        res.setPriceVndEstimate(q.getProductPriceCny().multiply(q.getExchangeRate()).setScale(0, RoundingMode.HALF_UP));
        res.setSeller(new SellerInfoDto(Objects.requireNonNullElse(q.getShopName(), "Chưa có tên shop"), q.getShopLevel(), q.getShopRating(), q.getShopReviewCount()));
        res.setTotalCny(price.totalCny()); res.setGrandTotalVnd(price.grandTotalVnd());
        res.setDepositAmountVnd(price.depositAmountVnd()); res.setDepositPercent(price.depositPercent());
        res.setCostBreakdown(price.costBreakdown()); res.setTranslationComplete(q.getTranslationComplete()); res.setExpiresAt(q.getExpiresAt());
        res.setExchangeRateUpdatedAt(q.getExchangeRateFetchedAt() == null ? null :
                q.getExchangeRateFetchedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
        return res;
    }
    private BigDecimal reviewStars(String input) {
        if (input == null) return null;
        try {
            BigDecimal pct = new BigDecimal(input.replace("%", "").trim());
            if (pct.signum() < 0 || pct.compareTo(BigDecimal.valueOf(100)) > 0) return null;
            return pct.divide(BigDecimal.valueOf(20), 2, RoundingMode.HALF_UP);
        } catch (NumberFormatException ex) { return null; }
    }
}
