/// <reference types="@types/google.maps" />
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Map, useMap, AdvancedMarker } from '@vis.gl/react-google-maps';
import { ArrowLeft, Save, Trash2, MapPin, Search, Plus, ChevronsRight, ChevronsLeft } from 'lucide-react';
import { useMockData } from '../contexts/MockDataContext';

export function EditRouteMapPage() {
  const { id } = useParams();
  const routeId = Number(id);
  const navigate = useNavigate();
  const { routes, setRoutes, stations: globalStations, setStations } = useMockData();

  const mapId = import.meta.env.VITE_GOOGLE_MAPS_ID || "DEMO_MAP_ID";
  const map = useMap(mapId);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const isDraggingMarker = useRef(false);

  const existingRoute = routes.find(r => r.id === routeId);

  // Component state
  const [routeName, setRouteName] = useState(existingRoute?.name || 'New Route');
  const [routeStationIds, setRouteStationIds] = useState<number[]>(existingRoute?.stationIds || []);
  const [stationSchedules, setStationSchedules] = useState<{ stationId: number; timeSlots: string[] }[]>(existingRoute?.stationSchedules || []);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [draftStations, setDraftStations] = useState<typeof globalStations>([]);
  const [activeStationId, setActiveStationId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Update map cursor
  useEffect(() => {
    if (map) {
      if (isEditMode && !activeStationId) {
        map.setOptions({ draggableCursor: 'crosshair' });
      } else {
        map.setOptions({ draggableCursor: null });
      }
    }
  }, [map, isEditMode, activeStationId]);

  // Parse initial path
  const initialPath = existingRoute?.route_lines ? JSON.parse(existingRoute.route_lines).map((p: any) => ({ lat: p.latitude, lng: p.longitude })) : [];

  // Derived state: stations currently in this route
  const currentStations = routeStationIds.map(sid => globalStations.find(s => s.id === sid)).filter(Boolean) as typeof globalStations;

  // Available stations to add (filtered by search)
  const availableStations = globalStations.filter(s => !routeStationIds.includes(s.id));
  const searchResults = availableStations.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Initialize editable polyline
  useEffect(() => {
    if (!map) return;

    const polyline = new google.maps.Polyline({
      path: initialPath.length > 0 ? initialPath : [{ lat: 2.929712, lng: 101.641765 }, { lat: 2.928712, lng: 101.642765 }],
      editable: true,
      strokeColor: '#113a9f',
      strokeOpacity: 0.8,
      strokeWeight: 4,
      map: map
    });

    polylineRef.current = polyline;

    return () => {
      polyline.setMap(null);
    };
  }, [map]);

  const handleSave = useCallback(() => {
    if (!polylineRef.current) return;

    const path = polylineRef.current.getPath();
    const newRouteLines: { latitude: number; longitude: number }[] = [];
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      newRouteLines.push({
        latitude: point.lat(),
        longitude: point.lng()
      });
    }

    if (existingRoute) {
      setRoutes(prev => prev.map(r => r.id === routeId ? {
        ...r,
        name: routeName,
        total_station: routeStationIds.length,
        route_lines: JSON.stringify(newRouteLines, null, 2),
        stationIds: routeStationIds,
        stationSchedules: stationSchedules
      } : r));
    } else if (id === 'new') {
      const newId = routes.length > 0 ? Math.max(...routes.map(r => r.id)) + 1 : 1;
      setRoutes(prev => [...prev, {
        id: newId,
        name: routeName,
        total_station: routeStationIds.length,
        route_lines: JSON.stringify(newRouteLines, null, 2),
        stationIds: routeStationIds,
        stationSchedules: stationSchedules
      }]);
    }

    alert(id === 'new' ? 'New route successfully created!' : 'Route successfully saved!');
    navigate('/routes');
  }, [id, routeId, routeName, routeStationIds, stationSchedules, setRoutes, existingRoute, navigate, routes, polylineRef]);

  const addStationToRoute = (stationId: number) => {
    setRouteStationIds([...routeStationIds, stationId]);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  const removeStationFromRoute = (stationId: number) => {
    setRouteStationIds(routeStationIds.filter(id => id !== stationId));
    setStationSchedules(stationSchedules.filter(ss => ss.stationId !== stationId));
  };

  if (!existingRoute && id !== 'new') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Route not found</h2>
          <button onClick={() => navigate('/routes')} className="text-blue-600 hover:underline">Go back to Routes</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 md:py-5 flex items-center justify-between z-10 shadow-sm relative shrink-0">
        <div className="flex items-center gap-4 md:gap-6">
          <button
            onClick={() => navigate('/routes')}
            className="group flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <div className="bg-slate-100 p-2 rounded-full group-hover:bg-slate-200 transition-colors">
              <ArrowLeft size={18} />
            </div>
            <span className="text-[15px] font-medium hidden md:block">Back to Routes</span>
          </button>
          <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
          <div className="flex items-center gap-4">
            <div className="w-[4px] md:w-[4px] h-7 md:h-8 rounded-[1px] bg-[#113a9f]"></div>
            <input
              type="text"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              className="text-xl md:text-[22px] font-bold text-slate-800 tracking-tight bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#113a9f] focus:outline-none focus:ring-0 px-1 py-0.5 w-64 md:w-96"
              placeholder="Enter route name"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center justify-center rounded-lg bg-[#113a9f] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-800 hover:shadow-lg transition-all"
        >
          <Save className="mr-2 -ml-1 h-4 w-4" />
          Save Configuration
        </button>
      </div>

      <div className="flex-1 w-full relative flex flex-col md:flex-row overflow-hidden">
        {/* Map Container */}
        <div className="w-full h-full md:flex-1 relative z-0">
          <Map
            id={mapId}
            defaultZoom={15}
            defaultCenter={initialPath.length > 0 ? initialPath[0] : { lat: 2.929712, lng: 101.641765 }}
            mapId={mapId}
            disableDefaultUI={true}
            gestureHandling="greedy"
            styles={[
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
              {
                featureType: "transit",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              }
            ]}
            onClick={(e) => {
              if (isEditMode && !isDraggingMarker.current && e.detail.latLng) {
                const newId = -Date.now();
                setDraftStations(prev => [...prev, { id: newId, latitude: e.detail.latLng!.lat, longitude: e.detail.latLng!.lng, name: '' }]);
                setActiveStationId(newId);
              }
            }}
          >
            {(isEditMode ? draftStations : currentStations).map(station => {
              const isCurrent = routeStationIds.includes(station.id);
              const isEditingThis = activeStationId === station.id;
              return (
                <AdvancedMarker
                  key={station.id}
                  position={{
                    lat: station.latitude,
                    lng: station.longitude
                  }}
                  draggable={isEditMode}
                  onClick={(e) => {
                    if (isEditMode) {
                      setActiveStationId(station.id);
                    }
                  }}
                  onDragStart={() => {
                    isDraggingMarker.current = true;
                  }}
                  onDragEnd={(e) => {
                    setTimeout(() => {
                      isDraggingMarker.current = false;
                    }, 300); // Prevent map click from firing immediately after drag ends

                    if (isEditMode && e.latLng) {
                      const newLat = e.latLng.lat();
                      const newLng = e.latLng.lng();
                      setDraftStations(prev => prev.map(s => s.id === station.id ? { ...s, latitude: newLat, longitude: newLng } : s));
                    }
                  }}
                >
                  <div className="relative flex items-center justify-center">
                    <div className={`absolute w-3 h-3 rounded-full ${(!isEditMode && isCurrent) ? 'bg-[#fbbf24]' : 'bg-slate-400'} shadow-[0_0_0_4px_white] z-10 transition-colors`}></div>
                    <div className="absolute top-4 bg-white px-2 py-1 rounded shadow text-xs font-bold whitespace-nowrap z-20">
                      {isEditingThis ? station.name || 'Editing...' : station.name}
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}


          </Map>

          <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg shadow-md font-medium text-sm transition-colors bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 mb-2"
              >
                <ChevronsLeft className="w-4 h-4" />
                Show Route Stations
              </button>
            )}
            {isEditMode ? (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to discard your changes?")) {
                      setIsEditMode(false);
                      setActiveStationId(null);
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg shadow-sm font-medium text-sm transition-colors bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                >
                  Discard
                </button>
                <button
                  onClick={() => {
                    const validStations = draftStations.filter(s => s.name.trim());
                    if (validStations.length !== draftStations.length) {
                      if (!confirm("Some stations have empty names and will be discarded. Continue?")) return;
                    }

                    let nextId = globalStations.length > 0 ? Math.max(...globalStations.map(s => s.id)) + 1 : 1;
                    const finalStations = validStations.map(s => s.id < 0 ? { ...s, id: nextId++ } : s);

                    setStations(finalStations);
                    setIsEditMode(false);
                    setActiveStationId(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md font-medium text-sm transition-colors bg-amber-500 text-white hover:bg-amber-600"
                >
                  <Save className="w-4 h-4" />
                  Save Station Changes
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsEditMode(true);
                  setDraftStations(globalStations);
                  setActiveStationId(null);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg shadow-md font-medium text-sm transition-colors bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              >
                <MapPin className="w-4 h-4" />
                Edit Stations
              </button>
            )}
          </div>

          {/* Top Unified Editor Popup */}
          {isEditMode && activeStationId !== null && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur-md p-5 rounded-xl shadow-2xl border border-slate-200 w-80">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-[16px] font-bold text-slate-900">
                  {activeStationId < 0 ? 'Create New Station' : 'Edit Station'}
                </h3>
                <button
                  onClick={() => setActiveStationId(null)}
                  className="text-slate-400 hover:text-slate-600 text-[11px] uppercase tracking-wider font-bold px-2 py-1 bg-slate-50 hover:bg-slate-100 rounded-md transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Station Name</label>
                <input
                  type="text"
                  value={draftStations.find(s => s.id === activeStationId)?.name || ''}
                  onChange={e => {
                    setDraftStations(prev => prev.map(s => s.id === activeStationId ? { ...s, name: e.target.value } : s));
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      setActiveStationId(null);
                    }
                  }}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
                  placeholder="e.g. FOB"
                  autoFocus
                />
              </div>

              <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 mb-0">
                {activeStationId < 0
                  ? "Drag the pin on the map to adjust its exact location."
                  : "Drag the pin to update location. Changes will be saved globally."}
              </p>
            </div>
          )}

          <div className="absolute bottom-6 left-6 right-6 md:right-auto md:left-1/2 md:-translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-slate-200 text-sm text-slate-700 font-medium flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full animate-pulse shrink-0 ${isEditMode ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
            {isEditMode
              ? "Click anywhere to create a station, or click/drag a marker to edit it."
              : "Drag the blue route line to adjust its path. Enter Edit Mode to manage stations."}
          </div>
        </div>

        {/* Sidebar Controls - Google Maps Style */}
        <div className={`hidden md:flex md:flex-col bg-white md:border-l border-gray-200 z-10 shadow-[-4px_0_24px_rgb(0,0,0,0.02)] overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'md:w-[400px] lg:w-[480px] md:shrink-0' : 'md:w-0 md:shrink border-none'}`}>
          <div className="p-6 md:p-8 bg-white flex flex-col h-full w-[400px] lg:w-[480px]">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="self-start mb-4 text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-50 p-1.5 rounded-md transition-colors"
              title="Collapse Panel"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
            <h2 className="text-[20px] md:text-[22px] font-bold text-slate-900 tracking-tight mb-6">Route Stations</h2>

            <div className="flex-1 overflow-y-auto pr-2 pb-20">
              <div className="relative ml-2 mt-4">
                {/* Vertical connecting line */}
                <div className="absolute left-[3px] top-[14px] bottom-12 w-[2px] bg-slate-200"></div>

                <div className="flex flex-col">
                  {/* Render existing stations */}
                  {currentStations.map((station) => (
                    <div key={station.id} className="relative flex items-start group mb-6">
                      <div className="absolute left-[-1.5px] top-[14px] w-3 h-3 rounded-full bg-slate-400 group-hover:bg-[#fbbf24] shadow-[0_0_0_4px_white] z-10 transition-colors"></div>

                      <div className="pl-6 md:pl-8 w-full">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 px-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="select-none">
                                <div className="flex items-center justify-between pr-2">
                                  <div className="text-[15px] md:text-[16px] font-bold text-slate-800">
                                    {station.name}
                                  </div>
                                </div>
                                <div className="text-[13px] text-slate-500 font-normal mt-0.5">
                                  {station.latitude.toFixed(5)}, {station.longitude.toFixed(5)}
                                </div>
                              </div>

                              <div className="mt-3 border-t border-slate-200 pt-3">
                                <div className="flex items-center justify-between mb-2">
                                  <label className="block text-[13px] font-medium text-slate-700">Bus Arrival Schedule</label>
                                  <button
                                    onClick={() => {
                                      const existing = stationSchedules.find(ss => ss.stationId === station.id);
                                      if (existing) {
                                        setStationSchedules(prev => prev.map(ss => ss.stationId === station.id ? { ...ss, timeSlots: [...ss.timeSlots, ''] } : ss));
                                      } else {
                                        setStationSchedules(prev => [...prev, { stationId: station.id, timeSlots: [''] }]);
                                      }
                                    }}
                                    className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors"
                                  >
                                    <Plus className="w-3 h-3 mr-1" /> Add Time
                                  </button>
                                </div>
                                <div className="space-y-2">
                                  {(stationSchedules.find(ss => ss.stationId === station.id)?.timeSlots || []).map((time, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                      <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => {
                                          const newTime = e.target.value;
                                          setStationSchedules(prev => prev.map(ss => {
                                            if (ss.stationId === station.id) {
                                              const newTimeSlots = [...ss.timeSlots];
                                              newTimeSlots[index] = newTime;
                                              return { ...ss, timeSlots: newTimeSlots };
                                            }
                                            return ss;
                                          }));
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            setStationSchedules(prev => prev.map(ss => ss.stationId === station.id ? { ...ss, timeSlots: [...ss.timeSlots, ''] } : ss));
                                          }
                                        }}
                                        className="block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 bg-white shadow-sm"
                                      />
                                      <button
                                        onClick={() => {
                                          setStationSchedules(prev => {
                                            return prev.map(ss => {
                                              if (ss.stationId === station.id) {
                                                const newTimeSlots = ss.timeSlots.filter((_, i) => i !== index);
                                                return { ...ss, timeSlots: newTimeSlots };
                                              }
                                              return ss;
                                            }).filter(ss => ss.timeSlots.length > 0);
                                          });
                                        }}
                                        className="text-slate-400 hover:text-red-600 p-1.5 rounded transition-colors bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200"
                                        title="Delete Time"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                  {!(stationSchedules.find(ss => ss.stationId === station.id)?.timeSlots?.length) && (
                                    <div className="text-[13px] text-slate-500 italic px-2 py-1 bg-slate-50 rounded-md border border-slate-100">No arrival times assigned.</div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => removeStationFromRoute(station.id)}
                              className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors ml-3 mt-1"
                              title="Remove from Route"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Google Maps style Add Destination Input */}
                  <div className="relative flex items-start mt-2">
                    <div className="absolute left-[-2px] top-[14px] w-3.5 h-3.5 rounded-full border-2 border-slate-300 bg-white shadow-[0_0_0_4px_white] z-10"></div>

                    <div className="pl-6 md:pl-8 w-full relative">
                      <div className="relative flex items-center bg-white border-2 border-blue-500 rounded-xl overflow-hidden shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-2 focus-within:ring-blue-100">
                        <div className="pl-4 text-slate-400">
                          <Search className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          placeholder={currentStations.length === 0 ? "Choose starting point..." : "What's your next destination?"}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onFocus={() => setIsSearchFocused(true)}
                          onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                          className="w-full px-3 py-3.5 text-[15px] text-slate-800 placeholder-slate-400 focus:outline-none"
                        />
                      </div>

                      {/* Dropdown Results */}
                      {isSearchFocused && (
                        <div className="absolute top-[calc(100%+8px)] left-6 right-0 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-200 z-50 overflow-hidden flex flex-col max-h-[300px]">
                          <div className="p-2 text-xs font-semibold text-slate-500 bg-slate-50 border-b border-slate-100 uppercase tracking-wider">
                            Global Stations
                          </div>
                          <div className="overflow-y-auto">
                            {searchResults.length === 0 ? (
                              <div className="p-4 text-[14px] text-slate-500 text-center">
                                {availableStations.length === 0
                                  ? "No more global stations available."
                                  : "No stations match your search."}
                              </div>
                            ) : (
                              searchResults.map(s => (
                                <div
                                  key={s.id}
                                  className="w-full text-left border-b border-slate-100 last:border-0 hover:bg-blue-50 transition-colors flex items-center justify-between group"
                                >
                                  <button onClick={() => addStationToRoute(s.id)} className="flex items-center gap-3 px-4 py-3 flex-1">
                                    <div className="bg-slate-100 p-2 rounded-full text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                      <MapPin className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                      <div className="font-bold text-slate-800 text-[15px]">{s.name}</div>
                                      <div className="text-[12px] text-slate-500">{s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}</div>
                                    </div>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm('Are you sure you want to delete this station globally?')) {
                                        setStations(prev => prev.filter(st => st.id !== s.id));
                                        setRouteStationIds(prev => prev.filter(id => id !== s.id));
                                        setStationSchedules(prev => prev.filter(ss => ss.stationId !== s.id));
                                      }
                                    }}
                                    className="p-2 mr-3 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-red-50 rounded-lg shadow-sm border border-transparent hover:border-red-100"
                                    title="Delete Station Globally"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
