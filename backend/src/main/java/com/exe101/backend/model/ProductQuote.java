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
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "product_quotes")
@Getter
@Setter
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

    @jakarta.persistence.ElementCollection(fetch = FetchType.EAGER)
    @jakarta.persistence.OrderColumn(name = "image_position")
    @Column(length = 2000)
    private java.util.List<String> imageUrls = new java.util.ArrayList<>();

    @jakarta.persistence.ElementCollection(fetch = FetchType.EAGER)
    @jakarta.persistence.OrderColumn(name = "variant_position")
    private java.util.List<ProductVariant> variants = new java.util.ArrayList<>();
    @Column(precision = 5, scale = 4) private BigDecimal serviceFeePercent;
    private Boolean sourcePriceVerified;
    private Integer shopReviewCount;
    private Boolean translationComplete;
    private java.time.LocalDateTime exchangeRateFetchedAt;
    private java.time.LocalDateTime expiresAt;
    @Column(precision = 15, scale = 2)
    private BigDecimal insuranceFeeVnd;
    @Column(precision = 5, scale = 4)
    private BigDecimal depositPercent;

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

    public ProductQuote() {
    }
}
