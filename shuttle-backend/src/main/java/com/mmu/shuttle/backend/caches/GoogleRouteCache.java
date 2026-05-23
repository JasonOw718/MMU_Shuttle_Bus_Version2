package com.mmu.shuttle.backend.caches;

import com.mmu.shuttle.backend.models.GoogleRouteModel;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class GoogleRouteCache {

    private final Map<Long, GoogleRouteModel> routeCache = new ConcurrentHashMap<>();

    public Optional<GoogleRouteModel> getRoute(Long activeBusId) {
        return Optional.ofNullable(routeCache.get(activeBusId));
    }

    public void storeRoute(Long activeBusId, GoogleRouteModel routeData) {
        routeCache.put(activeBusId, routeData);
    }

    public void clearRoute(Long activeBusId) {
        routeCache.remove(activeBusId);
    }

    public void clearCache() {
        routeCache.clear();
    }
}
