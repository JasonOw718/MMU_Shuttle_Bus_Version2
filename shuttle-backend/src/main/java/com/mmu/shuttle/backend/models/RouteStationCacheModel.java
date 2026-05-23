package com.mmu.shuttle.backend.models;

import lombok.Data;

import java.util.List;

@Data
public class RouteStationCacheModel {
    private Long id;
    private int sequence;
    private StationCacheModel station;
    private List<String> exclusiveTripTimes;
}
