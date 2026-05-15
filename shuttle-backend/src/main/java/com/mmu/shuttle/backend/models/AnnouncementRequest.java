package com.mmu.shuttle.backend.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class AnnouncementRequest {
    @NotBlank(message = "Title is required")
    @Size(min = 1, max = 80, message = "Title must be between 1 and 80 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 1, max = 500, message = "Description must be between 1 and 500 characters")
    private String description;

    @JsonProperty("isPinned")
    private boolean isPinned;
}
