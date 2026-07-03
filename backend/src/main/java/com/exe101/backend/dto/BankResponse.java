package com.exe101.backend.dto;

public class BankResponse {
    private Long id;
    private String bankName;
    private String accountNumber;
    private String accountHolderName;
    private String branch;
    private boolean isDefault;

    public BankResponse() {
    }

    public BankResponse(Long id, String bankName, String accountNumber, String accountHolderName, String branch, boolean isDefault) {
        this.id = id;
        this.bankName = bankName;
        this.accountNumber = accountNumber;
        this.accountHolderName = accountHolderName;
        this.branch = branch;
        this.isDefault = isDefault;
    }

    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}

    public String getBankName() {return bankName;}
    public void setBankName(String bankName) {this.bankName = bankName;}

    public String getAccountNumber() {return accountNumber;}
    public void setAccountNumber(String accountNumber) {this.accountNumber = accountNumber;}

    public String getAccountHolderName() {return accountHolderName;}
    public void setAccountHolderName(String accountHolderName) {this.accountHolderName = accountHolderName;}

    public String getBranch() {return branch;}
    public void setBranch(String branch) {this.branch = branch;}

    public boolean isDefault() {return isDefault;}
    public void setDefault(boolean isDefault) {this.isDefault = isDefault;}
}