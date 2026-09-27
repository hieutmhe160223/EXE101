package com.exe101.backend.model;
import jakarta.persistence.*;
import java.math.BigDecimal;
@Entity @Table(name="wallet_topups",uniqueConstraints=@UniqueConstraint(columnNames={"user_id","request_key"}))
public class WalletTopUp extends AuditableEntity {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id") public UserAccount user;
 @Column(nullable=false,precision=15,scale=0) public BigDecimal amount;
 @Column(nullable=false,unique=true,length=40) public String reference;
 @Column(name="request_key",nullable=false,length=80) public String requestKey;
 @Column(nullable=false,length=20) public String status="PENDING";
 @Column(nullable=false,length=40) public String bankCode;
 @Column(nullable=false,length=80) public String accountNumber;
 @Column(nullable=false,length=150) public String accountName;
 @Column(length=300) public String message;
 public java.time.LocalDateTime expiresAt;
 public java.time.LocalDateTime paidAt;
 public WalletTopUp() {}
}
