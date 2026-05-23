package com.mmu.shuttle.backend.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class StationDetailResponse {
    private Long id;
    private String name;
    private int sequence;
    private LocationModel locationModel;
    private List<String> schedules;
}
