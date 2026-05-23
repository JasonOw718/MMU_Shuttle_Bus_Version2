package com.mmu.shuttle.backend.services;

import com.mmu.shuttle.backend.caches.RouteCache;
import com.mmu.shuttle.backend.entities.Route;
import com.mmu.shuttle.backend.exceptions.ResourceNotFoundException;
import com.mmu.shuttle.backend.mappers.RouteModelMapper;
import com.mmu.shuttle.backend.models.RouteDetailResponse;
import com.mmu.shuttle.backend.models.RouteMobileResponse;
import com.mmu.shuttle.backend.models.RouteWebResponse;
import com.mmu.shuttle.backend.repositories.RouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RouteService {

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private RouteCache routeCache;

    @Autowired
    private RouteModelMapper routeModelMapper;

    @Autowired
    private ActiveBusStoreService activeBusStoreService;

    public List<RouteWebResponse> getAllRoutesForWeb() {
        return routeCache.getAllRoutes().stream().map((route -> {
            RouteWebResponse routeWebResponse = routeModelMapper.toRouteWebResponse(route);
            routeWebResponse.setLive(false);

            if(!activeBusStoreService.getActiveBusesByRouteId(route.getId()).isEmpty()){
                routeWebResponse.setLive(true);
            }
            return routeWebResponse;
        })).toList();
    }

    public List<RouteMobileResponse> getAllRoutesForMobile() {
        return routeCache.getAllRoutes().stream().map((route) -> routeModelMapper.toRouteMobileResponse(route)).toList();
    }

    public RouteDetailResponse getRouteById(Long routeId) {
        Route route = routeRepository.findRouteById(routeId).orElseThrow(() -> new ResourceNotFoundException("route with " + routeId + " is not found"));
        return routeModelMapper.toRouteDetailResponse(route);
    }

    public void refreshRouteCache() {
        routeCache.refreshCache();
    }
}