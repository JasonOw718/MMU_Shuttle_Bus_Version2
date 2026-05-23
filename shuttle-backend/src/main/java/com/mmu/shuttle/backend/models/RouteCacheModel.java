package com.mmu.shuttle.backend.models;

import lombok.Data;

import java.util.List;

@Data
public class RouteCacheModel {
    private Long id;
    private String name;
    private int totalStation;
    private List<LocationModel> routeLines;
    private List<RouteStationCacheModel> routeStations;
}
