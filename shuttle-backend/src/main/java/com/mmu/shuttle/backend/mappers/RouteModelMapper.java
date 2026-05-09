package com.mmu.shuttle.backend.mappers;

import com.mmu.shuttle.backend.entities.Route;
import com.mmu.shuttle.backend.entities.Schedule;
import com.mmu.shuttle.backend.entities.Station;
import com.mmu.shuttle.backend.models.*;
import com.mmu.shuttle.backend.utils.StyleUtils;
import com.mmu.shuttle.backend.utils.TimeUtils;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.stream.Collectors;

@Component
public class RouteModelMapper {

    public RouteDetailResponse toRouteDetailResponse(Route route) {
        RouteDetailResponse routeDetailResponse = new RouteDetailResponse();
        routeDetailResponse.setId(route.getId());
        routeDetailResponse.setName(route.getName());
        routeDetailResponse.setTotalStation(route.getTotalStation());

        // order highly dependent on the schedule id
        // will affect the station schedule if duplicate station exists within same route
        // and sql insert sequence is opposite (insert from last station -> first station)
        // as now default sorted by id
        Map<Long, Queue<Schedule>> schedulesByStationQueue = route.getSchedules().stream()
                .collect(Collectors.groupingBy(
                        schedule -> schedule.getStation().getId(),
                        Collectors.toCollection(LinkedList::new)
                ));

        List<StationDetailResponse> stationDetailResponses = route.getRouteStations().stream().map(routeStation -> {
            Station station = routeStation.getStation();
            int sequence = routeStation.getSequence();
            Queue<Schedule> stationQueue = schedulesByStationQueue.get(station.getId());

            Schedule stationSchedule = (stationQueue != null) ? stationQueue.poll() : null;

            return toStationDetailResponse(routeStation.getId(), station, stationSchedule, sequence,
                    routeStation.getExclusiveTripTimes());
        }).toList();

        routeDetailResponse.setStationDetailResponse(stationDetailResponses);

        List<LocationModel> locationModels = route.getRouteLines();
        routeDetailResponse.setRouteLines(locationModels);
        return routeDetailResponse;
    }

    public StationDetailResponse toStationDetailResponse(Long routeStationId, Station station, Schedule schedule,
            int sequence, List<String> exclusiveTripTimes) {
        StationDetailResponse stationDetailResponse = new StationDetailResponse();
        stationDetailResponse.setId(routeStationId);
        String displayName = station.getName();
        if (exclusiveTripTimes != null && !exclusiveTripTimes.isEmpty()) {
            displayName += " (" + String.join(", ", exclusiveTripTimes) + " Only)";
        }
        stationDetailResponse.setName(displayName);
        stationDetailResponse.setSequence(sequence);

        LocationModel locationModel = new LocationModel();
        locationModel.setLatitude(station.getLatitude());
        locationModel.setLongitude(station.getLongitude());

        stationDetailResponse.setLocationModel(locationModel);

        DayOfWeek today = LocalDate.now().getDayOfWeek();
        String nextArrival = "";

        if (today != DayOfWeek.SATURDAY && today != DayOfWeek.SUNDAY) {
            nextArrival = TimeUtils.findNextSlot(schedule.getTimeSlots());
        }

        stationDetailResponse.setNextBusArrivalTime(nextArrival);

        if(schedule != null){
            stationDetailResponse.setSchedules(schedule.getTimeSlots());
        }

        return stationDetailResponse;
    }

    public RouteWebResponse toRouteWebResponse(Route route) {
        RouteWebResponse routeWebResponse = new RouteWebResponse();
        routeWebResponse.setId(route.getId());
        routeWebResponse.setRouteName(route.getName());
        routeWebResponse.setTotalStations(route.getTotalStation());
        routeWebResponse.setColor(StyleUtils.getRouteColor(route.getId()));
        return routeWebResponse;
    }

    public RouteMobileResponse toRouteMobileResponse(Route route) {
        RouteMobileResponse routeMobileResponse = new RouteMobileResponse();
        routeMobileResponse.setId(route.getId());
        routeMobileResponse.setName(route.getName());
        routeMobileResponse.setTotalStations(route.getTotalStation());
        routeMobileResponse.setRouteLine(route.getRouteLines());

        List<StationMobileResponse> stations = route.getRouteStations().stream().map((routeStation)->{
            Station station = routeStation.getStation();
            if(station == null) return null;

            StationMobileResponse stationMobileResponse = new StationMobileResponse();
            stationMobileResponse.setId(station.getId());
            stationMobileResponse.setName(station.getName());

            LocationModel locationModel = new LocationModel();
            locationModel.setLatitude(station.getLatitude());
            locationModel.setLongitude(station.getLongitude());

            stationMobileResponse.setLocation(locationModel);
            return stationMobileResponse;
        }).toList();

        routeMobileResponse.setStations(stations);
        return routeMobileResponse;
    }
}
