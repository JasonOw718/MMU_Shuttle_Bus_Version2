package com.mmu.shuttle.backend.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class ActiveBusRequest {
    private Long routeId;
    private Long vehicleId;
    private LocationModel location;
}
