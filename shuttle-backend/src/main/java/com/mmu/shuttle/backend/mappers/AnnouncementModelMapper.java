package com.mmu.shuttle.backend.mappers;

import com.mmu.shuttle.backend.entities.Announcement;
import com.mmu.shuttle.backend.models.AnnouncementResponse;
import org.springframework.stereotype.Component;

@Component
public class AnnouncementModelMapper {

    public AnnouncementResponse  toAnnouncementResponse(Announcement announcement) {
        AnnouncementResponse announcementResponse = new AnnouncementResponse();
        announcementResponse.setId(announcement.getId());
        announcementResponse.setTitle(announcement.getTitle());
        announcementResponse.setDescription(announcement.getDescription());
        announcementResponse.setPinned(announcement.isPinned());
        announcementResponse.setFileName(announcement.getFileName());
        announcementResponse.setCreatedAt(announcement.getCreatedAt());
        announcementResponse.setBusPlate(
                announcement.getVehicle() != null
                        ? announcement.getVehicle().getBusPlate()
                        : "");
        return announcementResponse;
    }
}
