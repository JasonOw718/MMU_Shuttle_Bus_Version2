package com.mmu.shuttle.backend.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class AnnouncementResponse {
    private Long id;
    private String title;
    private String description;

    @JsonProperty("isPinned")
    private boolean isPinned;
    private String fileName;
    private LocalDateTime createdAt;
    private String busPlate;
}
