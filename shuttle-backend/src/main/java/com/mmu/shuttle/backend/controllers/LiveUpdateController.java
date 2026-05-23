package com.mmu.shuttle.backend.controllers;

import com.mmu.shuttle.backend.models.ActiveBusModel;
import com.mmu.shuttle.backend.models.BusLocationModel;
import com.mmu.shuttle.backend.services.ActiveBusStoreService;

import com.mmu.shuttle.backend.services.GoogleRouteRefreshSchedulerService;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/live-update")
public class LiveUpdateController {

    @Autowired
    private ActiveBusStoreService activeBusStoreService;

    @Autowired
    private GoogleRouteRefreshSchedulerService googleRouteRefreshSchedulerService;

    @MessageMapping("/updateLocation")
    public void getBusLiveLocation(@Payload BusLocationModel busLocationModel, Authentication authentication) {
        log.info("Received bus location update: {}", busLocationModel);
        activeBusStoreService.updateBusLocation(busLocationModel, authentication);
    }

    @PreAuthorize("hasRole('DRIVER')")
    @PostMapping("/clear")
    public ResponseEntity<Boolean> clearActiveBuses() {
        activeBusStoreService.clearActiveBuses();
        return new ResponseEntity<>(true, HttpStatus.OK);
    }

    @PreAuthorize("hasRole('DRIVER')")
    @PostMapping("/cancel-refresh/{id}")
    public ResponseEntity<Boolean> cancelGoogleRouteRefresh(@PathVariable("id") Long activeBusId) {
        googleRouteRefreshSchedulerService.cancelGoogleRouteRefresh(activeBusId);
        return new ResponseEntity<>(true, HttpStatus.OK);
    }

    @GetMapping("/active-buses")
    public ResponseEntity<List<ActiveBusModel>> getActiveBuses() {
        return new ResponseEntity<>(activeBusStoreService.getAllActiveBuses(), HttpStatus.OK);
    }
}
