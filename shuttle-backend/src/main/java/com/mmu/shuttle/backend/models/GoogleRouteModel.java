package com.mmu.shuttle.backend.models;

import lombok.Data;
import java.util.Map;

@Data
public class GoogleRouteModel {
    private Map<Long, GoogleRouteLegModel> legs;
    private Integer distanceMeters;
    private String duration;
}
