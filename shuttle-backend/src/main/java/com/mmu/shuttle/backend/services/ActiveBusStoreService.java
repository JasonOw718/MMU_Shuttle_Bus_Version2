package com.mmu.shuttle.backend.services;

import com.mmu.shuttle.backend.caches.ActiveBusStore;
import com.mmu.shuttle.backend.caches.RouteCache;
import com.mmu.shuttle.backend.entities.Route;
import com.mmu.shuttle.backend.entities.RouteStation;
import com.mmu.shuttle.backend.entities.Station;
import com.mmu.shuttle.backend.exceptions.ResourceNotFoundException;
import com.mmu.shuttle.backend.models.ActiveBusModel;
import com.mmu.shuttle.backend.models.ActiveBusRequest;
import com.mmu.shuttle.backend.models.BusLocationModel;
import com.mmu.shuttle.backend.models.LocationModel;
import com.mmu.shuttle.backend.securities.DriverDetail;
import com.mmu.shuttle.backend.utils.GeoUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

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

    public ActiveBusModel startRide(ActiveBusRequest activeBusRequest,Authentication authentication) {
        Long routeId = activeBusRequest.getRouteId();

        if (routeId == null) {
            throw new ResourceNotFoundException("Route Id is null");
        }

       String busPlate = authService.getBusPlateFromAuth(authentication);

        if(busPlate == null){
            throw new AuthorizationDeniedException("Invalid Credentials");
        }

        Route route = routeCache.getRoute(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("Route with id " + routeId + " is not found in cache"));

        Long nextRouteStationId = route.getRouteStations().stream()
                .filter(station -> 1 == station.getSequence())
                .findFirst()
                .map(RouteStation::getId)
                .orElse(null);

        if(nextRouteStationId == null){
            throw new ResourceNotFoundException("Next Station is Unknown");
        }

        LocationModel locationModel = activeBusRequest.getLocation();
        if (locationModel == null) {
            throw new ResourceNotFoundException("Location is null");
        }

        ActiveBusModel activeBusModel = activeBusStore.addActiveBus(routeId, busPlate, locationModel.getLongitude(), locationModel.getLatitude(), nextRouteStationId);
        simpMessagingTemplate.convertAndSend("/routes/active_buses/" + routeId, activeBusModel);
        return activeBusModel;
    }

    public void endRide(Long routeId,Authentication authentication) {
        String busPlate = authService.getBusPlateFromAuth(authentication);

        if(busPlate == null){
            throw new AuthorizationDeniedException("Invalid Credentials");
        }

        ActiveBusModel activeBusModel = activeBusStore.removeActiveBus(routeId, busPlate);
        if (activeBusModel != null) {
            simpMessagingTemplate.convertAndSend("/routes/active_buses/" + routeId, activeBusModel);
        }
    }

    public List<ActiveBusModel> getActiveBusesByRouteId(Long routeId) {
        return activeBusStore.getActiveBusesByRouteId(routeId);
    }

    public void updateBusLocation(BusLocationModel busLocationModel, Authentication authentication) {

        String busPlate = authService.getBusPlateFromAuth(authentication);

        Long routeId = busLocationModel.getRouteId();
        LocationModel newLocation = busLocationModel.getLocation();

        ActiveBusModel activeBusModel = activeBusStore.updateBusLocation(routeId, busPlate, newLocation);
        if (activeBusModel == null) return;

        Route route = routeCache.getRoute(routeId).orElse(null);
        checkAndAdvanceStation(route, activeBusModel, newLocation);
        simpMessagingTemplate.convertAndSend("/routes/active_buses/" + routeId, activeBusModel);
    }

    private void checkAndAdvanceStation(Route route, ActiveBusModel activeBusModel, LocationModel newLocation) {
        if (route == null || activeBusModel == null || activeBusModel.getNextBusRouteStationId() == null) {
            return;
        }

        List<RouteStation> stations = route.getRouteStations();

        if (activeBusModel.isAtStation() && activeBusModel.getLastVisitedRouteStationId() != null) {
            RouteStation lastStation = stations.stream()
                    .filter(rs -> rs.getStation() != null &&
                            Objects.equals(rs.getId(), activeBusModel.getLastVisitedRouteStationId()))
                    .findFirst()
                    .orElse(null);

            if (lastStation != null) {
                double distanceToLast = GeoUtils.calculateDistanceInMeters(
                        newLocation.getLatitude(), newLocation.getLongitude(),
                        lastStation.getStation().getLatitude(), lastStation.getStation().getLongitude()
                );

                if (distanceToLast > 50.0) {
                    activeBusModel.setAtStation(false);
                }
            }
        }

        long currentExpectedSequence = activeBusModel.getNextSequence();

        RouteStation physicallyReachedStation = null;
        double minDistance = Double.MAX_VALUE;
        long maxLookaheadSequence = currentExpectedSequence + 2;

        for (RouteStation rs : stations) {
            Station station = rs.getStation();
            if (station != null && rs.getSequence() >= currentExpectedSequence && rs.getSequence() <= maxLookaheadSequence) {
                double distance = GeoUtils.calculateDistanceInMeters(
                        newLocation.getLatitude(), newLocation.getLongitude(),
                        rs.getStation().getLatitude(), rs.getStation().getLongitude()
                );

                double allowedRadius = "FMD".equalsIgnoreCase(station.getName()) ? 100.0 : 50.0;

                if (distance <= allowedRadius && distance < minDistance) {
                    minDistance = distance;
                    physicallyReachedStation = rs;
                }
            }
        }

        if (physicallyReachedStation != null) {

            activeBusModel.setAtStation(true);
            activeBusModel.setLastVisitedRouteStationId(physicallyReachedStation.getId());

            long reachedSequence = physicallyReachedStation.getSequence();
            int targetSequence = -1;

            // Find the next available sequence number
            for (RouteStation rs : stations) {
                if (rs.getSequence() > reachedSequence) {
                    if (targetSequence == -1 || rs.getSequence() < targetSequence) {
                        targetSequence = rs.getSequence();
                    }
                }
            }

            activeBusModel.setNextSequence(targetSequence);

            if (targetSequence == -1) {
                activeBusModel.setNextBusRouteStationId(null);
            } else {
                Long targetRouteStationId = null;
                for (RouteStation rs : stations) {
                    if (rs.getSequence() == targetSequence) {
                        targetRouteStationId = rs.getId();
                        break;
                    }
                }
                activeBusModel.setNextBusRouteStationId(targetRouteStationId);
            }

        }
    }

    public Long getDriverActiveBusRouteId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getPrincipal().equals("anonymousUser")) {
            return null;
        }

        DriverDetail driverDetail = (DriverDetail) authentication.getPrincipal();
        ActiveBusModel activeBusModel = activeBusStore.getActiveBusByBusPlate(driverDetail.getBusPlate());
        if (activeBusModel == null) return null;

        return activeBusModel.getRouteId();
    }


    public void clearActiveBuses() {
        activeBusStore.resetAll();
    }
}