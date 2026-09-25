package com.exe101.backend.config;

import com.exe101.backend.model.*;
import com.exe101.backend.repository.*;
import com.exe101.backend.service.PricingService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Configuration
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "app.seed-demo", havingValue = "true")
public class DataInitializer {

        @Bean
        CommandLineRunner seedDefaultData(
                        UserAccountRepository userRepository,
                        ExchangeRateConfigRepository exchangeRateConfigRepository,
                        ServiceFeeConfigRepository serviceFeeConfigRepository,
                        ProductQuoteRepository productQuoteRepository,
                        PricingService pricingService,
                        PasswordEncoder passwordEncoder) {
                return args -> {
                        var admin = userRepository.findByEmail("admin@example.com")
                                        .orElseGet(() -> userRepository.save(new UserAccount(
                                                        "admin@example.com",
                                                        passwordEncoder.encode("Admin@123"),
                                                        "System Admin",
                                                        "ADMIN")));

                        var customer = userRepository.findByEmail("customer@example.com")
                                        .orElseGet(() -> userRepository.save(new UserAccount(
                                                        "customer@example.com",
                                                        passwordEncoder.encode("Customer@123"),
                                                        "Demo Customer",
                                                        "CUSTOMER")));

                        exchangeRateConfigRepository.findByCurrencyPair("CNYVND")
                                        .orElseGet(() -> exchangeRateConfigRepository.save(new ExchangeRateConfig(
                                                        "CNYVND",
                                                        new BigDecimal("3600.00"))));

                        serviceFeeConfigRepository.findByFeeCode("ORDER_SERVICE_PERCENT")
                                        .orElseGet(() -> serviceFeeConfigRepository.save(new ServiceFeeConfig(
                                                        "ORDER_SERVICE_PERCENT",
                                                        "Phi dich vu dat hang",
                                                        new BigDecimal("8.00"),
                                                        true)));

                        serviceFeeConfigRepository.findByFeeCode("INTERNATIONAL_SHIPPING_BASE")
                                        .orElseGet(() -> serviceFeeConfigRepository.save(new ServiceFeeConfig(
                                                        "INTERNATIONAL_SHIPPING_BASE",
                                                        "Phi van chuyen quoc te mac dinh",
                                                        new BigDecimal("35000.00"),
                                                        false)));

                        // Seed sample product quotes for demo and testing link analysis
                        if (productQuoteRepository.findFirstBySourceProductIdAndMarketplaceOrderByUpdatedAtDesc(
                                        "789123456", Marketplace.XIANYU).isEmpty()) {
                                ProductQuote q1 = new ProductQuote();
                                q1.setCreatedBy(admin);
                                q1.setMarketplace(Marketplace.XIANYU);
                                q1.setSourceUrl("https://www.goofish.com/item?id=789123456");
                                q1.setSourceProductId("789123456");
                                q1.setOriginalName("【99新】索尼 Sony WH-1000XM5 无线降噪耳机 国行正品");
                                q1.setTranslatedName("[99% Like New] Tai nghe Sony WH-1000XM5 Chống ồn cao cấp");
                                q1.setTranslatedDescription(
                                                "Tai nghe Sony WH-1000XM5 màu đen, hàng chính hãng fullbox 99%, chống ồn chủ động đỉnh cao, pin 30 giờ.");
                                q1.setImageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop");
                                q1.setImageUrls(List.of(
                                                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop",
                                                "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop"));
                                q1.setVariants(List.of(
                                                new ProductVariant("v1", "Màu Đen - 99% Fullbox",
                                                                new BigDecimal("1299.00"), 1),
                                                new ProductVariant("v2", "Màu Bạc - 98% No box",
                                                                new BigDecimal("1180.00"), 1)));
                                q1.setProductPriceCny(new BigDecimal("1299.00"));
                                q1.setDomesticShippingFeeCny(BigDecimal.ZERO);
                                q1.setExchangeRate(new BigDecimal("3600.00"));
                                q1.setExchangeRateFetchedAt(LocalDateTime.now());
                                q1.setServiceFeePercent(new BigDecimal("0.05"));
                                q1.setServiceFeeVnd(new BigDecimal("233820.00"));
                                q1.setInternationalShippingFeeVnd(new BigDecimal("35000.00"));
                                q1.setInsuranceFeeVnd(BigDecimal.ZERO);
                                q1.setDepositPercent(new BigDecimal("0.70"));
                                q1.setShopName("Shop Âm Thanh 2Hand Xianyu");
                                q1.setShopLevel(ShopLevel.L4);
                                q1.setShopRating(new BigDecimal("4.90"));
                                q1.setShopReviewCount(128);
                                q1.setSourcePriceVerified(true);
                                q1.setTranslationComplete(true);
                                q1.setExpiresAt(LocalDateTime.now().plusYears(1));
                                q1.setEstimatedTotalVnd(pricingService.calculate(q1, 1).grandTotalVnd());
                                productQuoteRepository.save(q1);
                        }

                        if (productQuoteRepository.findFirstBySourceProductIdAndMarketplaceOrderByUpdatedAtDesc(
                                        "666777888", Marketplace.TAOBAO).isEmpty()) {
                                ProductQuote q2 = new ProductQuote();
                                q2.setCreatedBy(admin);
                                q2.setMarketplace(Marketplace.TAOBAO);
                                q2.setSourceUrl("https://item.taobao.com/item.htm?id=666777888");
                                q2.setSourceProductId("666777888");
                                q2.setOriginalName("美式复古重磅连帽卫衣男女情侣宽松百搭秋冬加绒外套");
                                q2.setTranslatedName("Áo khoác Hoodie Unisex Form Rộng Phong Cách Đường Phố Vintage");
                                q2.setTranslatedDescription(
                                                "Áo khoác nỉ hoodie phong cách đường phố retro, chất vải cotton 450gsm dày dặn đứng form, lót lông cừu ấm áp.");
                                q2.setImageUrl("https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop");
                                q2.setImageUrls(List.of(
                                                "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop",
                                                "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop"));
                                q2.setVariants(List.of(
                                                new ProductVariant("v1", "Xám Tiêu - Size L", new BigDecimal("158.00"),
                                                                50),
                                                new ProductVariant("v2", "Đen Basic - Size XL",
                                                                new BigDecimal("158.00"), 35),
                                                new ProductVariant("v3", "Xanh Rêu Vintage - Size L",
                                                                new BigDecimal("168.00"), 20)));
                                q2.setProductPriceCny(new BigDecimal("158.00"));
                                q2.setDomesticShippingFeeCny(new BigDecimal("10.00"));
                                q2.setExchangeRate(new BigDecimal("3600.00"));
                                q2.setExchangeRateFetchedAt(LocalDateTime.now());
                                q2.setServiceFeePercent(new BigDecimal("0.05"));
                                q2.setServiceFeeVnd(new BigDecimal("28440.00"));
                                q2.setInternationalShippingFeeVnd(new BigDecimal("35000.00"));
                                q2.setInsuranceFeeVnd(BigDecimal.ZERO);
                                q2.setDepositPercent(new BigDecimal("0.70"));
                                q2.setShopName("Yufiz Vintage Official Store");
                                q2.setShopLevel(ShopLevel.UNKNOWN);
                                q2.setShopRating(new BigDecimal("4.80"));
                                q2.setShopReviewCount(1250);
                                q2.setSourcePriceVerified(true);
                                q2.setTranslationComplete(true);
                                q2.setExpiresAt(LocalDateTime.now().plusYears(1));
                                q2.setEstimatedTotalVnd(pricingService.calculate(q2, 1).grandTotalVnd());
                                productQuoteRepository.save(q2);
                        }

                        if (productQuoteRepository.findFirstBySourceProductIdAndMarketplaceOrderByUpdatedAtDesc(
                                        "888999111", Marketplace.TMALL).isEmpty()) {
                                ProductQuote q3 = new ProductQuote();
                                q3.setCreatedBy(admin);
                                q3.setMarketplace(Marketplace.TMALL);
                                q3.setSourceUrl("https://detail.tmall.com/item.htm?id=888999111");
                                q3.setSourceProductId("888999111");
                                q3.setOriginalName("机械键盘无线蓝牙三模客制化RGB热插拔Gasket结构电竞办公");
                                q3.setTranslatedName("Bàn phím cơ không dây Custom 3 chế độ RGB Hot-swap Gasket Mount");
                                q3.setTranslatedDescription(
                                                "Bàn phím cơ layout 75% cấu trúc Gasket Mount êm ái, switch linear mượt mà, hỗ trợ 3 chế độ kết nối Type-C/Bluetooth/2.4Ghz.");
                                q3.setImageUrl("https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop");
                                q3.setImageUrls(List.of(
                                                "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop",
                                                "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop"));
                                q3.setVariants(List.of(
                                                new ProductVariant("v1", "Trắng Xanh - White Switch (Linear)",
                                                                new BigDecimal("299.00"), 100),
                                                new ProductVariant("v2", "Đen Xám - Brown Switch (Tactile)",
                                                                new BigDecimal("299.00"), 80),
                                                new ProductVariant("v3", "Bản Full Nhôm CNC Cao Cấp",
                                                                new BigDecimal("459.00"), 15)));
                                q3.setProductPriceCny(new BigDecimal("299.00"));
                                q3.setDomesticShippingFeeCny(BigDecimal.ZERO);
                                q3.setExchangeRate(new BigDecimal("3600.00"));
                                q3.setExchangeRateFetchedAt(LocalDateTime.now());
                                q3.setServiceFeePercent(new BigDecimal("0.05"));
                                q3.setServiceFeeVnd(new BigDecimal("53820.00"));
                                q3.setInternationalShippingFeeVnd(new BigDecimal("35000.00"));
                                q3.setInsuranceFeeVnd(BigDecimal.ZERO);
                                q3.setDepositPercent(new BigDecimal("0.70"));
                                q3.setShopName("Tmall Digital Flagship Store");
                                q3.setShopLevel(ShopLevel.UNKNOWN);
                                q3.setShopRating(new BigDecimal("4.95"));
                                q3.setShopReviewCount(3420);
                                q3.setSourcePriceVerified(true);
                                q3.setTranslationComplete(true);
                                q3.setExpiresAt(LocalDateTime.now().plusYears(1));
                                q3.setEstimatedTotalVnd(pricingService.calculate(q3, 1).grandTotalVnd());
                                productQuoteRepository.save(q3);
                        }
                };
        }
}
