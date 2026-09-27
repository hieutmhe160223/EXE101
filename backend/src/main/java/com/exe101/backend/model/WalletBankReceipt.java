package com.exe101.backend.model;
import jakarta.persistence.*;
import java.math.BigDecimal;
@Entity @Table(name="wallet_bank_receipts")
public class WalletBankReceipt extends AuditableEntity {
 @Id @Column(length=100) public String id;
 @Column(nullable=false,unique=true,length=240) public String bankReference;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) public WalletTopUp topUp;
 @Column(nullable=false,precision=15,scale=0) public BigDecimal amount;
 @Column(nullable=false,length=20) public String status;
 @Column(length=300) public String note;
 public WalletBankReceipt() {}
}
