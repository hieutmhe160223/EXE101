package com.exe101.backend.repository;

import com.exe101.backend.dto.AdminDTO;
import com.exe101.backend.model.AccountStatus;
import com.exe101.backend.model.UserAccount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {

    Optional<UserAccount> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT new com.exe101.backend.dto.AdminDTO$CustomerResponse(" +
           "u.id, u.fullName, u.email, u.phoneNumber, " +
           "(SELECT COUNT(p) FROM PurchaseOrder p WHERE p.customer.id = u.id), " +
           "COALESCE(u.walletBalance, 0), u.status) " +
           "FROM UserAccount u")
    java.util.List<AdminDTO.CustomerResponse> findAllCustomersWithStats();

    @Query("SELECT new com.exe101.backend.dto.AdminDTO$CustomerResponse(" +
           "u.id, u.fullName, u.email, u.phoneNumber, " +
           "(SELECT COUNT(p) FROM PurchaseOrder p WHERE p.customer.id = u.id), " +
           "COALESCE(u.walletBalance, 0), u.status) " +
           "FROM UserAccount u " +
           "WHERE (:keyword IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "   OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "   OR LOWER(u.phoneNumber) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:status IS NULL OR u.status = :status)")
    Page<AdminDTO.CustomerResponse> searchCustomersForAdmin(
            @Param("keyword") String keyword,
            @Param("status") AccountStatus status,
            Pageable pageable
    );
}