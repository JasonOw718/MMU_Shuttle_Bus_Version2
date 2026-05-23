package com.mmu.shuttle.backend.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mmu.shuttle.backend.caches.GoogleRouteCache;
import com.mmu.shuttle.backend.models.GoogleRouteLegModel;
import com.mmu.shuttle.backend.models.GoogleRouteModel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
public class GoogleMapService {

    private static final String ROUTES_FIELD_MASK = "routes.duration,routes.distanceMeters,routes.legs.duration,routes.legs.distanceMeters";

    @Autowired
    private GoogleRouteCache googleRouteCache;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${google.maps.key}")
    private String googleMapsApiKey;

    @Value("${google.maps.compute-routes-url}")
    private String computeRoutesUrl;

    public void fetchRouteDataSync(Long activeBusId, JsonNode requestBody, List<Long> stationIds) {
        try {
            if (activeBusId == null || requestBody == null || stationIds == null || stationIds.isEmpty()) {
                return;
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Goog-Api-Key", googleMapsApiKey);
            headers.set("X-Goog-FieldMask", ROUTES_FIELD_MASK);

            HttpEntity<String> requestEntity = new HttpEntity<>(requestBody.toString(), headers);
            String responseBody = restTemplate.postForObject(computeRoutesUrl, requestEntity, String.class);

            JsonNode responseNode = responseBody == null ? null : objectMapper.readTree(responseBody);

            if (responseNode != null && responseNode.has("routes") && responseNode.get("routes").isArray()
                    && !responseNode.get("routes").isEmpty()) {
                JsonNode route0 = responseNode.get("routes").get(0);
                GoogleRouteModel routeModel = new GoogleRouteModel();
                if (route0.has("distanceMeters"))
                    routeModel.setDistanceMeters(route0.get("distanceMeters").asInt());
                if (route0.has("duration"))
                    routeModel.setDuration(route0.get("duration").asText());

                Map<Long, GoogleRouteLegModel> legsMap = new HashMap<>();
                if (route0.has("legs") && route0.get("legs").isArray()) {
                    JsonNode legsNode = route0.get("legs");
                    for (int i = 0; i < Math.min(legsNode.size(), stationIds.size()); i++) {
                        GoogleRouteLegModel leg = objectMapper.treeToValue(legsNode.get(i), GoogleRouteLegModel.class);
                        legsMap.put(stationIds.get(i), leg);
                    }
                }
                routeModel.setLegs(legsMap);

                googleRouteCache.storeRoute(activeBusId, routeModel);
            }

        } catch (Exception e) {
            log.error("Failed to fetch Google route data for active bus ID {}: {}", activeBusId, e);
        }
    }

    public Optional<GoogleRouteModel> getCachedRouteData(Long activeBusId) {
        return googleRouteCache.getRoute(activeBusId);
    }
}
