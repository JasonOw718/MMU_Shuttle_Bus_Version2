package com.mmu.shuttle.backend.models;

import lombok.Data;

@Data
public class StationCacheModel {
    private Long id;
    private String name;
    private double latitude;
    private double longitude;
}
