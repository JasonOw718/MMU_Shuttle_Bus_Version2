package com.mmu.shuttle.backend.mappers;

import com.mmu.shuttle.backend.entities.Vehicle;
import com.mmu.shuttle.backend.models.VehicleResponse;
import org.springframework.stereotype.Component;

@Component
public class VehicleModelMapper {

    public VehicleResponse toVehicleResponse(Vehicle vehicle) {
        VehicleResponse vehicleResponse = new VehicleResponse();
        vehicleResponse.setId(vehicle.getId());
        vehicleResponse.setBusPlate(vehicle.getBusPlate());
        return vehicleResponse;
    }
}
