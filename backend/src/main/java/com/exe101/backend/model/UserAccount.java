package com.exe101.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "user_accounts")
public class UserAccount extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false, length = 150)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Role role; // Đã đổi từ String sang Role

    @Column(length = 20)
    private String phoneNumber;

    @Column(length = 20)
    private String dateOfBirth;

    @Column(length = 500)
    private String avatarUrl;

    @Column(unique = true, length = 50)
    private String referralCode;

    @Column(length = 50)
    private String referredByCode;

    @Column
    private Integer loyaltyPoints = 0;

    @Column(precision = 15, scale = 2)
    private BigDecimal walletBalance = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AccountStatus status = AccountStatus.ACTIVE;

    protected UserAccount() {
    }

    // Constructor đã cập nhật kiểu dữ liệu Role
    public UserAccount(String email, String passwordHash, String fullName, Role role) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.fullName = fullName;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    // Getter trả về kiểu Role
    public Role getRole() {
        return role;
    }

    // Setter bổ sung cho Role
    public void setRole(Role role) {
        this.role = role;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }   

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public String getReferralCode() {
        return referralCode;
    }

    public String getReferredByCode() {
        return referredByCode;
    }

    public Integer getLoyaltyPoints() {
        return loyaltyPoints;
    }

    public BigDecimal getWalletBalance() {
        return walletBalance;
    }

    public AccountStatus getStatus() {
        return status;
    }

    public void setStatus(AccountStatus status) {
        this.status = status;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }
}