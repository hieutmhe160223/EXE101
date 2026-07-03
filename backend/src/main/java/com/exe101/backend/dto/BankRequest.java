package com.exe101.backend.dto;

public class BankRequest {
    private String email;
    private String bankName;
    private String accountNumber;
    private String accountHolderName;
    private String branch;
    private boolean isDefault;

    public BankRequest() {
    }

    public String getEmail() {return email;}
    public void setEmail(String email) {this.email = email;}

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