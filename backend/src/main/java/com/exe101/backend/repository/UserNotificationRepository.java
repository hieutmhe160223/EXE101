package com.exe101.backend.repository;

import com.exe101.backend.model.UserNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {
    Optional<UserNotification> findByEventKey(String eventKey);
    Optional<UserNotification> findByIdAndUserId(Long id, Long userId);
    List<UserNotification> findTop200ByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndReadAtIsNull(Long userId);
    @Modifying
    @Query("update UserNotification n set n.readAt=current_timestamp where n.user.id=:userId and n.readAt is null")
    int markAllRead(@Param("userId") Long userId);
}
