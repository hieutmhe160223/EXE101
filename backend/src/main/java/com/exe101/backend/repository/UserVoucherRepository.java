package com.exe101.backend.repository;

import com.exe101.backend.model.UserVoucher;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserVoucherRepository extends JpaRepository<UserVoucher, Long> {
    long countByVoucherIdAndUsedAtIsNotNull(Long voucherId);
}