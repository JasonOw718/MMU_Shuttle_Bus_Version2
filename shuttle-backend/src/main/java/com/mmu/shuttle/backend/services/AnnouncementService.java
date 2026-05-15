package com.mmu.shuttle.backend.services;

import com.mmu.shuttle.backend.entities.Announcement;
import com.mmu.shuttle.backend.entities.Driver;
import com.mmu.shuttle.backend.exceptions.ResourceNotFoundException;
import com.mmu.shuttle.backend.mappers.AnnouncementModelMapper;
import com.mmu.shuttle.backend.models.AnnouncementRequest;
import com.mmu.shuttle.backend.models.AnnouncementResponse;
import com.mmu.shuttle.backend.repositories.AnnouncementRepository;
import com.mmu.shuttle.backend.repositories.DriverRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Valid;
import jakarta.validation.Validator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;


@Service
public class AnnouncementService {

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private AnnouncementModelMapper announcementModelMapper;

    @Autowired
    private FileService fileService;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private Validator validator;

    public List<AnnouncementResponse> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByIsPinnedDescCreatedAtDesc().stream().map((announcement ->  announcementModelMapper.toAnnouncementResponse(announcement))).toList();
    }

    @Transactional
    public AnnouncementResponse toggleAnnouncement(Long id) {
        Announcement announcement = announcementRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Announcement with " + id + " is not found"));
        announcement.setPinned(!announcement.isPinned());
        return announcementModelMapper.toAnnouncementResponse(announcementRepository.save(announcement));
    }

    @Transactional
    public AnnouncementResponse createAnnouncement(@Valid AnnouncementRequest announcementRequest, MultipartFile file,
            Authentication authentication) {
        Long driverId = authService.getDriverIdFromAuth(authentication);

        Driver driver = driverRepository.findById(driverId).orElseThrow(() -> new ResourceNotFoundException("Driver with " + driverId + " is not found"));

        Announcement announcement = new Announcement();
        String fileName = "";
        if(file != null){
            fileName = fileService.uploadFile(file);
            announcement.setFileName(fileName);
        }

        Set<ConstraintViolation<AnnouncementRequest>> violations = validator.validate(announcementRequest);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }

        announcement.setTitle(announcementRequest.getTitle());
        announcement.setDescription(announcementRequest.getDescription());
        announcement.setPinned(announcementRequest.isPinned());
        announcement.setCreatedAt(LocalDateTime.now());
        announcement.setDriver(driver);

        try {
            Announcement savedAnnouncement = announcementRepository.save(announcement);
            return announcementModelMapper.toAnnouncementResponse(savedAnnouncement);
        }catch (Exception e){
            if(file != null){
                fileService.deleteFile(fileName);
            }
            throw e;
        }
    }

    @Transactional
    public int deleteAnnouncements() {
        try {
            LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);

            List<Announcement> oldAnnouncements = announcementRepository.findAllByCreatedAtBefore(oneMonthAgo);

            for (Announcement ann : oldAnnouncements) {
                fileService.deleteFile(ann.getFileName());
            }

            announcementRepository.deleteAllByCreatedAtBefore(oneMonthAgo);

            return oldAnnouncements.size();
        }catch (Exception e){
            throw e;
        }
    }
}
