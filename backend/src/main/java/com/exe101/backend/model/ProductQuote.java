package com.exe101.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "product_quotes")
public class ProductQuote extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private UserAccount createdBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Marketplace marketplace;

    @Column(nullable = false, length = 1000)
    private String sourceUrl;

    @Column(length = 150)
    private String sourceProductId;

    @Column(length = 300)
    private String originalName;

    @Column(length = 300)
    private String translatedName;

    @Column(length = 1000)
    private String imageUrl;

    @Lob
    private String translatedDescription;

    @Column(length = 200)
    private String shopName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ShopLevel shopLevel = ShopLevel.UNKNOWN;

    @Column(precision = 4, scale = 2)
    private BigDecimal shopRating;

    @Lob
    private String similarProductsJson;

    @Column(precision = 15, scale = 2)
    private BigDecimal productPriceCny;

    @Column(precision = 15, scale = 2)
    private BigDecimal domesticShippingFeeCny;

    @Column(precision = 15, scale = 2)
    private BigDecimal serviceFeeVnd;

    @Column(precision = 15, scale = 2)
    private BigDecimal internationalShippingFeeVnd;

    @Column(precision = 15, scale = 2)
    private BigDecimal exchangeRate;

    @Column(precision = 15, scale = 2)
    private BigDecimal estimatedTotalVnd;

    protected ProductQuote() {
    }
    public BigDecimal getEstimatedTotalVnd() {
        return estimatedTotalVnd;
    }

    public String getTranslatedName() {
        return translatedName;
    }

    public String getOriginalName() {
        return originalName;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Long getId() {
        return id;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }

    public String getShopName() {
        return shopName;
    }

    public BigDecimal getProductPriceCny() {
        return productPriceCny;
    }

    public BigDecimal getDomesticShippingFeeCny() {
        return domesticShippingFeeCny;
    }

    public BigDecimal getServiceFeeVnd() {
        return serviceFeeVnd;
    }

    public BigDecimal getInternationalShippingFeeVnd() {
        return internationalShippingFeeVnd;
    }

    public BigDecimal getExchangeRate() {
        return exchangeRate;
    }
}
