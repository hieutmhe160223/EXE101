package com.exe101.backend.service;

import com.exe101.backend.dto.ChangePasswordRequest;
import com.exe101.backend.dto.UpdateProfileRequest;
import com.exe101.backend.model.UserAccount;
import com.exe101.backend.model.UserAddress;
import com.exe101.backend.model.UserBank;   
import com.exe101.backend.repository.UserAccountRepository;
import com.exe101.backend.dto.AddressRequest;
import com.exe101.backend.dto.AddressResponse;
import com.exe101.backend.dto.BankRequest;   
import com.exe101.backend.dto.BankResponse; 
import com.exe101.backend.repository.UserBankRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.exe101.backend.repository.UserAddressRepository;
import java.util.List;
import java.util.stream.Collectors;
@Service
public class UserService {

    private final UserAccountRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserAddressRepository userAddressRepository;
    private final UserBankRepository userBankRepository;

    public UserService(UserAccountRepository userRepository, PasswordEncoder passwordEncoder, UserAddressRepository userAddressRepository, UserBankRepository userBankRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userAddressRepository = userAddressRepository;
        this.userBankRepository = userBankRepository;
    }

    @Transactional
    public void updateProfile(UpdateProfileRequest request) {
        UserAccount user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy       người dùng với email: " + request.email()));

        user.setFullName(request.fullName());
        user.setPhoneNumber(request.phoneNumber());
        user.setDateOfBirth(request.dob());
        userRepository.save(user);
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        UserAccount user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu mới không khớp");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void addShippingAddress(AddressRequest request) {
    UserAccount user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản người dùng!"));

    if (request.isDefault()) {
        List<UserAddress> existingAddresses = userAddressRepository.findByUserEmail(request.getEmail());
        for (UserAddress addr : existingAddresses) {
            if (addr.isDefault()) {
                addr.setDefault(false);
                userAddressRepository.save(addr); 
            }
        }
    }
    UserAddress newAddress = new UserAddress(
        request.getFullName(),
        request.getPhoneNumber(),     
        request.getDetailAddress(),   
        request.isDefault(),
        user
    );
    userAddressRepository.save(newAddress);
    }

    @Transactional
    public void updateShippingAddress(Long addressId, AddressRequest request) {
    UserAddress existingAddress = userAddressRepository.findById(addressId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ cần cập nhật!"));

    if (request.isDefault()) {
        List<UserAddress> allUserAddresses = userAddressRepository.findByUserEmail(request.getEmail());
        for (UserAddress addr : allUserAddresses) {
            if (addr.isDefault() && !addr.getId().equals(addressId)) {
                addr.setDefault(false);
                userAddressRepository.save(addr);
            }
        }
    }
    existingAddress.setFullName(request.getFullName());
    existingAddress.setPhone(request.getPhoneNumber());
    existingAddress.setAddressDetail(request.getDetailAddress());
    existingAddress.setDefault(request.isDefault());
    userAddressRepository.save(existingAddress);
    }

    @Transactional
    public void deleteShippingAddress(Long addressId) {
    UserAddress address = userAddressRepository.findById(addressId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ cần xóa!"));
    userAddressRepository.delete(address);
}
    
    @Transactional(readOnly = true)
    public List<AddressResponse> getUserAddressesByEmail(String email) {
    userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản người dùng!"));

    List<UserAddress> addresses = userAddressRepository.findByUserEmail(email);

    return addresses.stream()
            .map(addr -> new AddressResponse(
                    addr.getId(),
                    addr.getFullName(),
                    addr.getPhone(),          
                    addr.getAddressDetail(),  
                    addr.isDefault()
            ))
            .collect(Collectors.toList());
}
    @Transactional(readOnly = true)
    public List<BankResponse> getBankAccounts(String email) {
        UserAccount user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email: " + email));
                
        return userBankRepository.findByUser(user).stream()
                .map(bank -> new BankResponse(
                        bank.getId(),
                        bank.getBankName(),
                        bank.getAccountNumber(),
                        bank.getAccountHolderName(),
                        bank.getBranch(),
                        bank.isDefault()
                ))
                .collect(Collectors.toList());
    }
    @Transactional
    public void addBankAccount(BankRequest request) {
        UserAccount user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email: " + request.getEmail()));
        if (request.isDefault()) {
            List<UserBank> existingBanks = userBankRepository.findByUser(user);
            for (UserBank bank : existingBanks) {
                if (bank.isDefault()) {
                    bank.setDefault(false); 
                    userBankRepository.save(bank);
                }
            }
        }

        UserBank newBank = new UserBank(
            request.getBankName(),
            request.getAccountNumber(),
            request.getAccountHolderName(),
            request.getBranch(),
            request.isDefault(),
            user
        );

        userBankRepository.save(newBank);
    }

    @Transactional
    public void updateBankAccount(Long id, BankRequest request) {
        UserBank existingBank = userBankRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản ngân hàng cần cập nhật!"));

        if (request.isDefault()) {
            UserAccount user = existingBank.getUser();
            List<UserBank> allUserBanks = userBankRepository.findByUser(user);
            for (UserBank bank : allUserBanks) {
                if (bank.isDefault() && !bank.getId().equals(id)) {
                    bank.setDefault(false); 
                    userBankRepository.save(bank);
                }
            }
        }
        existingBank.setBankName(request.getBankName());
        existingBank.setAccountNumber(request.getAccountNumber());
        existingBank.setAccountHolderName(request.getAccountHolderName());
        existingBank.setBranch(request.getBranch());
        existingBank.setDefault(request.isDefault());

        userBankRepository.save(existingBank);
    }

    @Transactional
    public void deleteBankAccount(Long id) {
        UserBank bank = userBankRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản ngân hàng cần xóa!"));
        userBankRepository.delete(bank);
    }
}