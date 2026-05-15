package com.mmu.shuttle.backend.caches;

import com.mmu.shuttle.backend.exceptions.DuplicateResourceException;
import com.mmu.shuttle.backend.models.ActiveBusModel;
import com.mmu.shuttle.backend.models.LocationModel;
import com.mmu.shuttle.backend.utils.StyleUtils;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class ActiveBusStore {

    private final ConcurrentHashMap<Long, List<ActiveBusModel>> activeBuses = new ConcurrentHashMap<>();
    private final Map<Long, Integer> routeTicketDispenser = new ConcurrentHashMap<>();
    private final AtomicLong currentActiveBusId = new AtomicLong(1L);

    public ActiveBusModel addActiveBus(Long routeId, String busPlate, Long driverId, Long vehicleId, double longitude,
            double latitude,
            Long nextRouteStationId) {

        boolean busExists = activeBuses.values().stream()
                .flatMap(List::stream)
                .anyMatch(bus -> vehicleId.equals(bus.getVehicleId()));

        if (busExists) {
            throw new DuplicateResourceException("Vehicle with id " + vehicleId + " is already in a ride.");
        }

        boolean driverExists = activeBuses.values().stream()
                .flatMap(List::stream)
                .anyMatch(bus -> driverId.equals(bus.getDriverId()));

        if (driverExists) {
            throw new DuplicateResourceException("Driver with id " + driverId + " is already in a ride.");
        }

        int myTicket = routeTicketDispenser.compute(routeId, (key, currentValue) ->
                (currentValue == null) ? 1 : currentValue + 1
        );

        ActiveBusModel activeBusModel = new ActiveBusModel();
        Long activeBusId = currentActiveBusId.getAndIncrement();
        activeBusModel.setId(activeBusId);
        activeBusModel.setBusPlate(busPlate);
        activeBusModel.setDriverId(driverId);
        activeBusModel.setVehicleId(vehicleId);
        activeBusModel.setRouteId(routeId);
        activeBusModel.setNextBusRouteStationId(nextRouteStationId);
        activeBusModel.setNextSequence(1);
        activeBusModel.setColor(StyleUtils.getBusIconColor(myTicket));
        activeBusModel.setAtStation(false);
        activeBusModel.setLastVisitedRouteStationId(null);

        LocationModel locationModel = new LocationModel();
        locationModel.setLatitude(latitude);
        locationModel.setLongitude(longitude);
        activeBusModel.setLocation(locationModel);

        activeBuses.computeIfAbsent(routeId, k -> new CopyOnWriteArrayList<>()).add(activeBusModel);

        return activeBusModel;
    }

    public ActiveBusModel removeActiveBus(Long routeId, Long driverId) {
        List<ActiveBusModel> activeBusModels = activeBuses.get(routeId);

        if (activeBusModels == null) {
            return null;
        }

        ActiveBusModel busToRemove = activeBusModels.stream()
                .filter(bus -> driverId.equals(bus.getDriverId()))
                .findFirst()
                .orElse(null);

        if(busToRemove != null) {
            busToRemove.setActive(false);
        }

        activeBusModels.remove(busToRemove);

        if (activeBusModels.isEmpty()) {
            activeBuses.remove(routeId);
        }

        return busToRemove;
    }

    public List<ActiveBusModel> getActiveBusesByRouteId(Long routeId){
        return activeBuses.getOrDefault(routeId, new ArrayList<>());
    }

    public ActiveBusModel updateBusLocation(Long routeId, Long driverId, LocationModel newLocation) {
        List<ActiveBusModel> activeBusModels = activeBuses.get(routeId);

        if (activeBusModels != null && !activeBusModels.isEmpty()) {
            for (ActiveBusModel bus : activeBusModels) {
                if (driverId.equals(bus.getDriverId())) {
                    bus.setLocation(newLocation);
                    return bus;
                }
            }
        }

        return null;
    }

    public ActiveBusModel getActiveBusByDriverId(Long driverId) {
        return activeBuses.values().stream()
                .flatMap(List::stream)
                .filter(bus -> driverId.equals(bus.getDriverId()))
                .findFirst()
                .orElse(null);
    }

    public void resetAll() {
        activeBuses.clear();
        routeTicketDispenser.clear();
        currentActiveBusId.set(1L);
    }
}

