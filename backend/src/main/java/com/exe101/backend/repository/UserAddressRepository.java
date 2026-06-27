package com.exe101.backend.repository;

import com.exe101.backend.model.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {
        List<UserAddress> findByUserEmail(String email);
}