package com.mmu.shuttle.backend.repositories;

import com.mmu.shuttle.backend.entities.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RouteRepository extends JpaRepository<Route, Long> {

    @Query("SELECT r FROM Route r " +
            "JOIN FETCH r.routeStations rs " +
            "JOIN FETCH rs.station s " +
            "WHERE r.id=:id ORDER BY rs.sequence ASC")
    Optional<Route> findRouteById(@Param("id") Long id);

    @Query("SELECT r FROM Route r " +
            "JOIN FETCH r.routeStations rs " +
            "JOIN FETCH rs.station s " +
            "ORDER BY r.id, rs.sequence ASC")
    List<Route> findAllWithStations();
}
