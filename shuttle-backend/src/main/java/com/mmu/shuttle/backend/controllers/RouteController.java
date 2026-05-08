package com.mmu.shuttle.backend.controllers;

import com.mmu.shuttle.backend.models.*;
import com.mmu.shuttle.backend.services.ActiveBusStoreService;
import com.mmu.shuttle.backend.services.RouteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    @Autowired
    private RouteService routeService;

    @Autowired
    private ActiveBusStoreService activeBusStoreService;

    @GetMapping("/web")
    public ResponseEntity<List<RouteWebResponse>> getAllRoutesForWeb(){
        return new ResponseEntity<>(routeService.getAllRoutesForWeb(), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('DRIVER')")
    @GetMapping("/mobile")
    public ResponseEntity<List<RouteMobileResponse>> getAllRoutesForMobile() {
        return new ResponseEntity<>(routeService.getAllRoutesForMobile(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RouteDetailResponse> getRouteById(@PathVariable("id") Long id){
        return new ResponseEntity<>(routeService.getRouteById(id),HttpStatus.OK);
    }

    @PreAuthorize("hasRole('DRIVER')")
    @PostMapping("/start")
    public ResponseEntity<ActiveBusModel> startRide(@RequestBody ActiveBusRequest activeBusRequest, Authentication authentication){
        return new ResponseEntity<>(activeBusStoreService.startRide(activeBusRequest,authentication),HttpStatus.OK);
    }

    @PreAuthorize("hasRole('DRIVER')")
    @PostMapping("/end")
    public ResponseEntity<Boolean> endRide(@RequestParam Long routeId, Authentication authentication){
        activeBusStoreService.endRide(routeId,authentication);
        return new ResponseEntity<>(true,HttpStatus.OK);
    }

    @GetMapping("/{id}/active")
    public ResponseEntity<List<ActiveBusModel>> getActiveBusesByRouteId(@PathVariable("id") Long id){
        return new ResponseEntity<>(activeBusStoreService.getActiveBusesByRouteId(id),HttpStatus.OK);
    }

    @PreAuthorize("hasRole('DRIVER')")
    @GetMapping("/driver/active")
    public ResponseEntity<Long> getDriverActiveBus(Authentication authentication){
        return new ResponseEntity<>(activeBusStoreService.getDriverActiveBusRouteId(authentication),HttpStatus.OK);
    }

    @PreAuthorize("hasRole('DRIVER')")
    @PostMapping("/refresh")
    public ResponseEntity<Boolean> refreshRouteCache(){
        routeService.refreshRouteCache();
        return new ResponseEntity<>(true,HttpStatus.OK);
    }

}
