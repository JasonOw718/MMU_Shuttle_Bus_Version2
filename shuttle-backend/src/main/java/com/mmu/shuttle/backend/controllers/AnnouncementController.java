package com.mmu.shuttle.backend.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mmu.shuttle.backend.exceptions.FileException;
import com.mmu.shuttle.backend.models.AnnouncementRequest;
import com.mmu.shuttle.backend.models.AnnouncementResponse;
import com.mmu.shuttle.backend.services.AnnouncementService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    @Autowired
    private AnnouncementService announcementService;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping("/all")
    public ResponseEntity<List<AnnouncementResponse>> getAllAnnouncements() {
        return new ResponseEntity<>(announcementService.getAllAnnouncements(), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('DRIVER')")
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<AnnouncementResponse> toggleAnnouncements(@PathVariable("id") Long id) {
        return new ResponseEntity<>(announcementService.toggleAnnouncement(id), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('DRIVER')")
    @PostMapping("/create")
    public ResponseEntity<AnnouncementResponse> createAnnouncement(
            @RequestPart("announcement") String announcementRequest,
            @RequestPart(value = "file", required = false) MultipartFile file,
            Authentication authentication) throws JsonProcessingException {
        try {
            AnnouncementRequest createAnnouncementModel =
                    objectMapper.readValue(announcementRequest, AnnouncementRequest.class);


            return new ResponseEntity<>(
                    announcementService.createAnnouncement(createAnnouncementModel, file, authentication),
                    HttpStatus.OK
            );

        } catch (FileException e) {
            throw e;
        }catch (JsonProcessingException e) {
            log.error(e.getMessage());
            throw e;
        }
    }

    @PreAuthorize("hasRole('DRIVER')")
    @PostMapping("/delete")
    public ResponseEntity<Boolean> clearAnnouncement(){
        announcementService.deleteAnnouncements();
        return new ResponseEntity<>(true, HttpStatus.OK);
    }
}
