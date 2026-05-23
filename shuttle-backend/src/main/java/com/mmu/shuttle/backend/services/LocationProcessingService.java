package com.mmu.shuttle.backend.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mmu.shuttle.backend.caches.RouteCache;
import com.mmu.shuttle.backend.models.RouteCacheModel;
import com.mmu.shuttle.backend.models.RouteStationCacheModel;
import com.mmu.shuttle.backend.models.StationCacheModel;
import com.mmu.shuttle.backend.models.ActiveBusModel;
import com.mmu.shuttle.backend.models.LocationModel;
import com.mmu.shuttle.backend.models.GoogleRouteModel;
import com.mmu.shuttle.backend.models.GoogleRouteLegModel;
import com.mmu.shuttle.backend.utils.GeoUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
public class LocationProcessingService {

    private static final long ETA_REFRESH_INTERVAL_MILLIS = 10_000L;

    @Autowired
    private RouteCache routeCache;

    @Autowired
    private GoogleMapService googleMapService;

    @Autowired
    private ObjectMapper objectMapper;

    public void checkAndAdvanceStation(RouteCacheModel route, ActiveBusModel activeBusModel, LocationModel newLocation) {
        if (route == null || activeBusModel == null || activeBusModel.getNextBusRouteStationId() == null) {
            return;
        }

        List<RouteStationCacheModel> stations = route.getRouteStations();

        if (activeBusModel.isAtStation() && activeBusModel.getLastVisitedRouteStationId() != null) {
            RouteStationCacheModel lastStation = stations.stream()
                    .filter(rs -> rs.getStation() != null &&
                            Objects.equals(rs.getId(), activeBusModel.getLastVisitedRouteStationId()))
                    .findFirst()
                    .orElse(null);

            if (lastStation != null) {
                double distanceToLast = GeoUtils.calculateDistanceInMeters(
                        newLocation.getLatitude(), newLocation.getLongitude(),
                        lastStation.getStation().getLatitude(), lastStation.getStation().getLongitude());

                if (distanceToLast > 50.0) {
                    activeBusModel.setAtStation(false);
                }
            }
        }

        long currentExpectedSequence = activeBusModel.getNextSequence();

        RouteStationCacheModel physicallyReachedStation = null;
        double minDistance = Double.MAX_VALUE;
        long maxLookaheadSequence = currentExpectedSequence + 2;

        for (RouteStationCacheModel rs : stations) {
            StationCacheModel station = rs.getStation();
            if (station != null && rs.getSequence() >= currentExpectedSequence
                    && rs.getSequence() <= maxLookaheadSequence) {
                double distance = GeoUtils.calculateDistanceInMeters(
                        newLocation.getLatitude(), newLocation.getLongitude(),
                        rs.getStation().getLatitude(), rs.getStation().getLongitude());

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

            for (RouteStationCacheModel rs : stations) {
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
                Long targetRouteStationCacheModelId = null;
                for (RouteStationCacheModel rs : stations) {
                    if (rs.getSequence() == targetSequence) {
                        targetRouteStationCacheModelId = rs.getId();
                        break;
                    }
                }
                activeBusModel.setNextBusRouteStationId(targetRouteStationCacheModelId);
            }

        }
    }

    public void calculateETA(Long routeId, ActiveBusModel activeBusModel) {
        try {
            if (routeId == null || activeBusModel == null || activeBusModel.getLocation() == null) {
                return;
            }

            long currentTime = System.currentTimeMillis();

            if (currentTime - activeBusModel.getLastEtaCalculationTime() <= ETA_REFRESH_INTERVAL_MILLIS) {
                return;
            }

            activeBusModel.setLastEtaCalculationTime(currentTime);

            if (activeBusModel.getNextSequence() < 0 || activeBusModel.getNextBusRouteStationId() == null) {
                activeBusModel.getEtas().clear();
                return;
            }

            RouteCacheModel route = routeCache.getRoute(routeId).orElse(null);
            if (route == null) {
                log.warn("Route with id {} not found in cache", routeId);
                return;
            }

            GoogleRouteModel response = googleMapService
                    .getCachedRouteData(activeBusModel.getId())
                    .orElse(null);
            if (response == null) {
                return;
            }

            Map<Long, GoogleRouteLegModel> legs = response.getLegs();
            if (legs == null || legs.isEmpty()) {
                return;
            }

            List<RouteStationCacheModel> allStations = route.getRouteStations().stream()
                    .filter(routeStation -> routeStation.getStation() != null)
                    .sorted(Comparator.comparingInt(RouteStationCacheModel::getSequence))
                    .toList();

            int minimumSequence = Math.max(2, activeBusModel.getNextSequence());
            List<RouteStationCacheModel> upcomingStations = allStations.stream()
                    .filter(routeStation -> routeStation.getSequence() >= minimumSequence)
                    .toList();

            if (upcomingStations.isEmpty()) {
                activeBusModel.getEtas().clear();
                return;
            }

            Map<Long, Integer> etas = new HashMap<>();

            RouteStationCacheModel firstUpcomingStation = upcomingStations.get(0);
            GoogleRouteLegModel firstLeg = legs.get(firstUpcomingStation.getId());

            int cumulativeDurationSeconds = 0;

            if (firstLeg == null) {
                double distMeters = GeoUtils.calculateDistanceInMeters(
                        activeBusModel.getLocation().getLatitude(), activeBusModel.getLocation().getLongitude(),
                        firstUpcomingStation.getStation().getLatitude(),
                        firstUpcomingStation.getStation().getLongitude());
                cumulativeDurationSeconds = (int) (distMeters / 5.0);
                log.warn("Cache miss for station {}. Using estimated duration of {} seconds.",
                        firstUpcomingStation.getId(), cumulativeDurationSeconds);
            }

            cumulativeDurationSeconds = calculateRemainingDurationSeconds(
                    activeBusModel,
                    allStations,
                    firstUpcomingStation,
                    firstLeg);

            etas.put(firstUpcomingStation.getId(), cumulativeDurationSeconds / 60);

            for (int i = 1; i < upcomingStations.size(); i++) {
                RouteStationCacheModel station = upcomingStations.get(i);
                GoogleRouteLegModel leg = legs.get(station.getId());

                if (leg != null) {
                    cumulativeDurationSeconds += parseDurationSeconds(leg.getDuration());
                }

                etas.put(station.getId(), cumulativeDurationSeconds / 60);
            }

            activeBusModel.getEtas().clear();
            activeBusModel.getEtas().putAll(etas);
        } catch (Exception e) {
            log.error("Failed to calculate ETAs for route {} and active bus {}: {}", routeId, activeBusModel.getId(),
                    e);
        }
    }

    public void updateGoogleRouteCache(Long routeId, ActiveBusModel activeBusModel) {
        RouteCacheModel route = routeCache.getRoute(routeId).orElse(null);
        if (route == null)
            return;

        List<RouteStationCacheModel> routeStations = route.getRouteStations().stream()
                .filter(routeStation -> routeStation.getSequence() >= Math.max(2, activeBusModel.getNextSequence())
                        && routeStation.getStation() != null)
                .sorted(Comparator.comparingInt(RouteStationCacheModel::getSequence))
                .toList();

        if (routeStations.isEmpty())
            return;

        List<Long> stationIds = routeStations.stream().map(RouteStationCacheModel::getId).toList();
        JsonNode requestBody = buildGoogleRouteRequest(routeId, activeBusModel);

        if (requestBody != null) {
            googleMapService.fetchRouteDataSync(activeBusModel.getId(), requestBody, stationIds);
        }
    }

    private int calculateRemainingDurationSeconds(ActiveBusModel activeBusModel, List<RouteStationCacheModel> allStations,
            RouteStationCacheModel nextStation, GoogleRouteLegModel leg) {
        if (leg == null) {
            return 0;
        }
        int totalDurationSeconds = parseDurationSeconds(leg.getDuration());
        if (totalDurationSeconds <= 0 || nextStation == null || nextStation.getStation() == null) {
            return 0;
        }

        RouteStationCacheModel previousStation = allStations.stream()
                .filter(routeStation -> routeStation.getSequence() < nextStation.getSequence())
                .reduce((first, second) -> second)
                .orElse(null);

        double totalDistanceMeters;
        if (previousStation != null && previousStation.getStation() != null) {
            totalDistanceMeters = GeoUtils.calculateDistanceInMeters(
                    previousStation.getStation().getLatitude(),
                    previousStation.getStation().getLongitude(),
                    nextStation.getStation().getLatitude(),
                    nextStation.getStation().getLongitude());
        } else {
            totalDistanceMeters = (leg.getDistanceMeters() != null ? leg.getDistanceMeters() : 0.0);
        }

        if (totalDistanceMeters <= 0) {
            return totalDurationSeconds;
        }

        double remainingDistanceMeters = GeoUtils.calculateDistanceInMeters(
                activeBusModel.getLocation().getLatitude(),
                activeBusModel.getLocation().getLongitude(),
                nextStation.getStation().getLatitude(),
                nextStation.getStation().getLongitude());

        double remainingRatio = Math.max(0.0, Math.min(1.0, remainingDistanceMeters / totalDistanceMeters));
        return (int) Math.round(totalDurationSeconds * remainingRatio);
    }

    private int parseDurationSeconds(String duration) {
        if (duration == null || duration.isBlank()) {
            return 0;
        }

        String normalizedDuration = duration.trim();
        if (normalizedDuration.endsWith("s")) {
            normalizedDuration = normalizedDuration.substring(0, normalizedDuration.length() - 1);
        }

        return (int) Math.round(Double.parseDouble(normalizedDuration));
    }

    private JsonNode buildGoogleRouteRequest(Long routeId, ActiveBusModel activeBusModel) {
        try {
            if (routeId == null || activeBusModel == null || activeBusModel.getLocation() == null) {
                return null;
            }

            RouteCacheModel route = routeCache.getRoute(routeId).orElse(null);
            if (route == null) {
                return null;
            }

            List<RouteStationCacheModel> routeStations = route.getRouteStations().stream()
                    .filter(routeStation -> routeStation.getSequence() >= Math.max(2, activeBusModel.getNextSequence())
                            && routeStation.getStation() != null)
                    .sorted((first, second) -> Integer.compare(first.getSequence(), second.getSequence()))
                    .toList();

            if (routeStations.isEmpty()) {
                return null;
            }

            List<Map<String, Object>> waypoints = routeStations.stream()
                    .map(routeStation -> toWaypoint(routeStation.getStation().getLatitude(),
                            routeStation.getStation().getLongitude()))
                    .toList();

            Map<String, Object> requestBody = Map.of(
                    "origin",
                    toWaypoint(activeBusModel.getLocation().getLatitude(), activeBusModel.getLocation().getLongitude()),
                    "destination", waypoints.get(waypoints.size() - 1),
                    "intermediates", waypoints,
                    "travelMode", "DRIVE",
                    "routingPreference", "TRAFFIC_AWARE");

            return objectMapper.valueToTree(requestBody);
        } catch (Exception e) {
            log.warn("Failed to build Google route request for route {}: {}", routeId, e);
            return null;
        }
    }

    private Map<String, Object> toWaypoint(double latitude, double longitude) {
        return Map.of(
                "location", Map.of(
                        "latLng", Map.of(
                                "latitude", latitude,
                                "longitude", longitude)));
    }
}
