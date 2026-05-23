package com.mmu.shuttle.backend.services;

import com.mmu.shuttle.backend.caches.ActiveBusStore;
import com.mmu.shuttle.backend.caches.RouteCache;
import com.mmu.shuttle.backend.entities.Vehicle;
import com.mmu.shuttle.backend.models.RouteCacheModel;
import com.mmu.shuttle.backend.models.RouteStationCacheModel;
import com.mmu.shuttle.backend.exceptions.ResourceNotFoundException;
import com.mmu.shuttle.backend.models.ActiveBusModel;
import com.mmu.shuttle.backend.models.ActiveBusRequest;
import com.mmu.shuttle.backend.models.BusLocationModel;
import com.mmu.shuttle.backend.models.LocationModel;
import com.mmu.shuttle.backend.repositories.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActiveBusStoreService {

    @Autowired
    private ActiveBusStore activeBusStore;

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @Autowired
    private RouteCache routeCache;

    @Autowired
    private AuthService authService;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private LocationProcessingService locationProcessingService;

    @Autowired
    private GoogleRouteRefreshSchedulerService googleRouteRefreshSchedulerService;

    public ActiveBusModel startRide(ActiveBusRequest activeBusRequest, Authentication authentication) {
        Long routeId = activeBusRequest.getRouteId();

        if (routeId == null) {
            throw new ResourceNotFoundException("Route Id is null");
        }

        Long vehicleId = activeBusRequest.getVehicleId();
        if (vehicleId == null) {
            throw new ResourceNotFoundException("Vehicle Id is null");
        }

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle with id " + vehicleId + " is not found"));
        String busPlate = vehicle.getBusPlate();

        Long driverId = authService.getDriverIdFromAuth(authentication);

        RouteCacheModel route = routeCache.getRoute(routeId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Route with id " + routeId + " is not found in cache"));

        Long nextRouteStationId = route.getRouteStations().stream()
                .filter(station -> 1 == station.getSequence())
                .findFirst()
                .map(RouteStationCacheModel::getId)
                .orElse(null);

        if (nextRouteStationId == null) {
            throw new ResourceNotFoundException("Next Station is Unknown");
        }

        LocationModel locationModel = activeBusRequest.getLocation();
        if (locationModel == null) {
            throw new ResourceNotFoundException("Location is null");
        }

        ActiveBusModel activeBusModel = activeBusStore.addActiveBus(routeId, busPlate, driverId, vehicleId,
                locationModel.getLongitude(), locationModel.getLatitude(), nextRouteStationId);

        locationProcessingService.updateGoogleRouteCache(routeId, activeBusModel);
        locationProcessingService.calculateETA(routeId, activeBusModel);
        simpMessagingTemplate.convertAndSend("/routes/active_buses/" + routeId, activeBusModel);

        googleRouteRefreshSchedulerService.scheduleGoogleRouteRefresh(routeId, activeBusModel);
        return activeBusModel;
    }

    public void endRide(Long routeId, Authentication authentication) {
        Long driverId = authService.getDriverIdFromAuth(authentication);

        ActiveBusModel activeBusModel = activeBusStore.removeActiveBus(routeId, driverId);
        if (activeBusModel != null) {
            googleRouteRefreshSchedulerService.cancelGoogleRouteRefresh(activeBusModel.getId());
            simpMessagingTemplate.convertAndSend("/routes/active_buses/" + routeId, activeBusModel);
        }
    }

    public List<ActiveBusModel> getActiveBusesByRouteId(Long routeId) {
        return activeBusStore.getActiveBusesByRouteId(routeId);
    }

    public List<ActiveBusModel> getAllActiveBuses() {
        return activeBusStore.getAllActiveBuses();
    }

    public void updateBusLocation(BusLocationModel busLocationModel, Authentication authentication) {

        Long driverId = authService.getDriverIdFromAuth(authentication);

        Long routeId = busLocationModel.getRouteId();
        LocationModel newLocation = busLocationModel.getLocation();

        ActiveBusModel activeBusModel = activeBusStore.updateBusLocation(routeId, driverId, newLocation);
        if (activeBusModel == null)
            return;

        RouteCacheModel route = routeCache.getRoute(routeId).orElse(null);
        locationProcessingService.checkAndAdvanceStation(route, activeBusModel, newLocation);
        locationProcessingService.calculateETA(routeId, activeBusModel);
        simpMessagingTemplate.convertAndSend("/routes/active_buses/" + routeId, activeBusModel);
    }

    public Long getDriverActiveBusRouteId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getPrincipal().equals("anonymousUser")) {
            return null;
        }

        Long driverId = authService.getDriverIdFromAuth(authentication);
        ActiveBusModel activeBusModel = activeBusStore.getActiveBusByDriverId(driverId);
        if (activeBusModel == null)
            return null;

        return activeBusModel.getRouteId();
    }

    public void clearActiveBuses() {
        googleRouteRefreshSchedulerService.cancelAllGoogleRouteRefresh();
        activeBusStore.resetAll();
    }
}