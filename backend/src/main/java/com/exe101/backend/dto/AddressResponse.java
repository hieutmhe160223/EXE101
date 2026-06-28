package com.exe101.backend.dto;

public class AddressResponse {
    private Long id;
    private String fullName;
    private String phone;         
    private String addressDetail;  
    private boolean isDefault;

    public AddressResponse() {
    }

    public AddressResponse(Long id, String fullName, String phone, String addressDetail, boolean isDefault) {
        this.id = id;
        this.fullName = fullName;
        this.phone = phone;
        this.addressDetail = addressDetail;
        this.isDefault = isDefault;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddressDetail() { return addressDetail; }
    public void setAddressDetail(String addressDetail) { this.addressDetail = addressDetail; }

    public boolean isDefault() { return isDefault; }
    public void setDefault(boolean isDefault) { this.isDefault = isDefault; }
}