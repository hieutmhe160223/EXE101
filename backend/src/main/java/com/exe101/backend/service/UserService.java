package com.exe101.backend.service;

import com.exe101.backend.dto.ChangePasswordRequest;
import com.exe101.backend.dto.UpdateProfileRequest;
import com.exe101.backend.model.UserAccount;
import com.exe101.backend.model.UserAddress;
import com.exe101.backend.repository.UserAccountRepository;
import com.exe101.backend.dto.AddressRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.exe101.backend.repository.UserAddressRepository;
import java.util.List;
@Service
public class UserService {

    private final UserAccountRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserAddressRepository userAddressRepository;
    
    public UserService(UserAccountRepository userRepository, PasswordEncoder passwordEncoder, UserAddressRepository userAddressRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userAddressRepository = userAddressRepository;
    }

    @Transactional
    public void updateProfile(UpdateProfileRequest request) {
        UserAccount user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email: " + request.email()));

        user.setFullName(request.fullName());
        user.setPhoneNumber(request.phoneNumber());

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
}