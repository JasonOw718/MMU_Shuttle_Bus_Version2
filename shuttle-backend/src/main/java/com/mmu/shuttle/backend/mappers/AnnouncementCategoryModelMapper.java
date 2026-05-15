package com.mmu.shuttle.backend.mappers;

import com.mmu.shuttle.backend.entities.AnnouncementCategory;
import com.mmu.shuttle.backend.models.AnnouncementCategoryResponse;
import org.springframework.stereotype.Component;

@Component
public class AnnouncementCategoryModelMapper {

    public AnnouncementCategoryResponse toAnnouncementCategoryResponse(AnnouncementCategory category) {
        AnnouncementCategoryResponse response = new AnnouncementCategoryResponse();
        response.setId(category.getId());
        response.setTitle(category.getTitle());
        response.setDescription(category.getDescription());
        return response;
    }
}
