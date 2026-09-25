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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "wallet_transactions")
public class WalletTransaction extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private WalletTransactionType type;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amountVnd = BigDecimal.ZERO;

    @Column(length = 500)
    private String description;

    @Column(unique = true, length = 100)
    private String reference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private PurchaseOrder order;

    @Column(precision = 15, scale = 2)
    private BigDecimal balanceBefore;

    @Column(precision = 15, scale = 2)
    private BigDecimal balanceAfter;

    protected WalletTransaction() {
    }
    public WalletTransaction(UserAccount user,BigDecimal amount,String description) {
        this.user=user;this.amountVnd=amount;this.description=description;this.type=WalletTransactionType.TOP_UP;
    }
    public WalletTransaction(UserAccount user,WalletTransactionType type,BigDecimal amount,String description) {
        if(user==null||type==null||amount==null||amount.signum()==0)throw new IllegalArgumentException("Giao dịch ví không hợp lệ");
        this.user=user;this.type=type;this.amountVnd=amount;this.description=description;
    }
    public WalletTransaction(UserAccount user,WalletTransactionType type,BigDecimal amount,String description,
            String reference,PurchaseOrder order,BigDecimal balanceBefore,BigDecimal balanceAfter) {
        this(user,type,amount,description);
        this.reference=reference;this.order=order;this.balanceBefore=balanceBefore;this.balanceAfter=balanceAfter;
    }
    public String getReference(){return reference;}
    public BigDecimal getBalanceBefore(){return balanceBefore;}
    public BigDecimal getBalanceAfter(){return balanceAfter;}
}
