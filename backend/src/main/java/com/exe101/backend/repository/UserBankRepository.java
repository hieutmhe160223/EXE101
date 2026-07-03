package com.exe101.backend.repository;

import com.exe101.backend.model.UserBank;
import com.exe101.backend.model.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserBankRepository extends JpaRepository<UserBank, Long> {
    List<UserBank> findByUser(UserAccount user);
    List<UserBank> findByUserAndIsDefault(UserAccount user, boolean isDefault);
}