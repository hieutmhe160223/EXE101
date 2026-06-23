package com.exe101.backend.repository;

import com.exe101.backend.model.InspectionMedia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InspectionMediaRepository extends JpaRepository<InspectionMedia, Long> {

    List<InspectionMedia> findByOrderIdOrderByCreatedAtAsc(Long orderId);
}
