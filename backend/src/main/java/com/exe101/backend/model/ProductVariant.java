package com.exe101.backend.model;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
@Embeddable @Getter @Setter @NoArgsConstructor
public class ProductVariant {
    @Column(length=100) private String variantId;
    @Column(length=1000) private String label;
    @Column(precision=15,scale=2) private BigDecimal priceCny;
    private Integer stock;
    public ProductVariant(String variantId,String label,BigDecimal priceCny,Integer stock) {
        this.variantId=variantId;this.label=label;this.priceCny=priceCny;this.stock=stock;
    }
}
