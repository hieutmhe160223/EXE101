package com.exe101.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public class ProductQuoteResponse {
    private Long quoteId;
    private String nameZh;
    private String nameVi;
    private String descriptionVi;
    private List<String> images;
    private BigDecimal priceCny;
    private BigDecimal priceVndEstimate;
    private SellerInfoDto seller;
    private List<CostBreakdownItemDto> costBreakdown;
    private BigDecimal totalCny;
    private BigDecimal grandTotalVnd;
    private BigDecimal depositAmountVnd;
    private BigDecimal exchangeRate;
    private String exchangeRateUpdatedAt;

    // getters + setters
    public Long getQuoteId() { return quoteId; }
    public void setQuoteId(Long quoteId) { this.quoteId = quoteId; }
    public String getNameZh() { return nameZh; }
    public void setNameZh(String nameZh) { this.nameZh = nameZh; }
    public String getNameVi() { return nameVi; }
    public void setNameVi(String nameVi) { this.nameVi = nameVi; }
    public String getDescriptionVi() { return descriptionVi; }
    public void setDescriptionVi(String descriptionVi) { this.descriptionVi = descriptionVi; }
    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
    public BigDecimal getPriceCny() { return priceCny; }
    public void setPriceCny(BigDecimal priceCny) { this.priceCny = priceCny; }
    public BigDecimal getPriceVndEstimate() { return priceVndEstimate; }
    public void setPriceVndEstimate(BigDecimal priceVndEstimate) { this.priceVndEstimate = priceVndEstimate; }
    public SellerInfoDto getSeller() { return seller; }
    public void setSeller(SellerInfoDto seller) { this.seller = seller; }
    public List<CostBreakdownItemDto> getCostBreakdown() { return costBreakdown; }
    public void setCostBreakdown(List<CostBreakdownItemDto> costBreakdown) { this.costBreakdown = costBreakdown; }
    public BigDecimal getTotalCny() { return totalCny; }
    public void setTotalCny(BigDecimal totalCny) { this.totalCny = totalCny; }
    public BigDecimal getGrandTotalVnd() { return grandTotalVnd; }
    public void setGrandTotalVnd(BigDecimal grandTotalVnd) { this.grandTotalVnd = grandTotalVnd; }
    public BigDecimal getDepositAmountVnd() { return depositAmountVnd; }
    public void setDepositAmountVnd(BigDecimal depositAmountVnd) { this.depositAmountVnd = depositAmountVnd; }
    public BigDecimal getExchangeRate() { return exchangeRate; }
    public void setExchangeRate(BigDecimal exchangeRate) { this.exchangeRate = exchangeRate; }
    public String getExchangeRateUpdatedAt() { return exchangeRateUpdatedAt; }
    public void setExchangeRateUpdatedAt(String exchangeRateUpdatedAt) { this.exchangeRateUpdatedAt = exchangeRateUpdatedAt; }
}