package com.mmu.shuttle.backend.services;

import com.mmu.shuttle.backend.models.ActiveBusModel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

@Slf4j
@Service
public class GoogleRouteRefreshSchedulerService {

    private static final Duration GOOGLE_ROUTE_REFRESH_INTERVAL = Duration.ofMinutes(2);

    @Autowired
    @Qualifier("googleApiScheduler")
    private TaskScheduler taskScheduler;

    @Autowired
    private LocationProcessingService locationProcessingService;

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    private final Map<Long, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();

    public void scheduleGoogleRouteRefresh(Long routeId, ActiveBusModel activeBusModel) {
        if (routeId == null || activeBusModel == null || activeBusModel.getId() == null) {
            return;
        }

        cancelGoogleRouteRefresh(activeBusModel.getId());

        ScheduledFuture<?> scheduledTask = taskScheduler.scheduleAtFixedRate(
                () -> {
                    log.info("Executing scheduled Google route refresh for bus ID: {} on route ID: {}",
                            activeBusModel.getId(), routeId);
                    try {
                        locationProcessingService.updateGoogleRouteCache(routeId, activeBusModel);

                        locationProcessingService.calculateETA(routeId, activeBusModel);
                        simpMessagingTemplate.convertAndSend("/routes/active_buses/" + routeId, activeBusModel);
                    } catch (Exception e) {
                        log.error("Failed to update Google route cache for bus ID: {}. Error: {}",
                                activeBusModel.getId(), e);
                    }
                },
                Instant.now().plus(GOOGLE_ROUTE_REFRESH_INTERVAL),
                GOOGLE_ROUTE_REFRESH_INTERVAL
        );
        scheduledTasks.put(activeBusModel.getId(), scheduledTask);
    }

    public void cancelGoogleRouteRefresh(Long activeBusId) {
        if (activeBusId == null) {
            return;
        }

        ScheduledFuture<?> scheduledTask = scheduledTasks.remove(activeBusId);
        if (scheduledTask != null) {
            scheduledTask.cancel(false);
            log.info("Canceled scheduled Google route refresh for bus ID: {}", activeBusId);
        }
    }

    public void cancelAllGoogleRouteRefresh() {
        for (Map.Entry<Long, ScheduledFuture<?>> entry : scheduledTasks.entrySet()) {
            entry.getValue().cancel(false);
            log.info("Canceled scheduled Google route refresh for bus ID: {}", entry.getKey());
        }
        scheduledTasks.clear();
        log.info("All scheduled Google route refreshes have been canceled.");
    }
}
