package com.mmu.shuttle.backend.caches;

import com.mmu.shuttle.backend.mappers.RouteModelMapper;
import com.mmu.shuttle.backend.models.RouteCacheModel;
import com.mmu.shuttle.backend.repositories.RouteRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class RouteCache {

    private Map<Long, RouteCacheModel> routeCache = new ConcurrentHashMap<>();

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private RouteModelMapper routeModelMapper;

    @PostConstruct
    public void initCache() {
        routeCache = routeRepository.findAllWithStations().stream()
                .map(routeModelMapper::toRouteCacheModel)
                .collect(Collectors.toMap(RouteCacheModel::getId, model -> model));
    }

    public Optional<RouteCacheModel> getRoute(Long routeId) {
        return Optional.ofNullable(routeCache.get(routeId));
    }

    public List<RouteCacheModel> getAllRoutes() {
        return new ArrayList<>(routeCache.values());
    }

    public void refreshCache() {
        initCache();
    }
}