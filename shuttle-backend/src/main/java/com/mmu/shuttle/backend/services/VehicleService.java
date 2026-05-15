package com.mmu.shuttle.backend.services;

import com.mmu.shuttle.backend.mappers.VehicleModelMapper;
import com.mmu.shuttle.backend.models.VehicleResponse;
import com.mmu.shuttle.backend.repositories.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private VehicleModelMapper vehicleModelMapper;

    public List<VehicleResponse> getAllVehicles() {
        return vehicleRepository.findAll().stream()
                .map(vehicleModelMapper::toVehicleResponse)
                .toList();
    }
}
