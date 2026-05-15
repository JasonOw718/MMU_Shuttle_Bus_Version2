package com.mmu.shuttle.backend.repositories;

import com.mmu.shuttle.backend.entities.AnnouncementCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnnouncementCategoryRepository extends JpaRepository<AnnouncementCategory, Long> {
}
