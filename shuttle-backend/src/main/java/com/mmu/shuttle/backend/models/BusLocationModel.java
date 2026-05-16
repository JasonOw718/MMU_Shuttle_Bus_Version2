package com.mmu.shuttle.backend.models;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class BusLocationModel {
    Long routeId;
    LocationModel location;

    // --- Debug Payload Metadata ---
    private Double speed;           // Used to verify if the bus is physically stationary
    private Double accuracy;        // Used to detect GPS signal drift or "garbage" coordinates
    private Integer batteryLevel;   // The smoking gun for aggressive OS background kills
    private Boolean isCharging;     // Detects if the driver unplugged the device
    private String appState;        // Expected values: "foreground" or "background"
    private Instant timestamp;      // The exact moment the device recorded the location (not the server receipt time)
}
