import { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useMockData } from '../contexts/MockDataContext';
import type { Station } from '../contexts/MockDataContext';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import type { MapMouseEvent } from '@vis.gl/react-google-maps';

export function StationsPage() {
  const { stations, setStations } = useMockData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_ID || "DEMO_MAP_ID";
  
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: ''
  });

  const openModal = (station?: Station) => {
    if (station) {
      setEditingStation(station);
      setFormData({
        name: station.name,
        latitude: station.latitude.toString(),
        longitude: station.longitude.toString()
      });
    } else {
      setEditingStation(null);
      // Default to MMU Cyberjaya coordinates if empty
      setFormData({ name: '', latitude: '2.929712', longitude: '101.641765' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStation(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (editingStation) {
      setStations(stations.map(s => s.id === editingStation.id ? { ...s, name: formData.name, latitude: lat, longitude: lng } : s));
    } else {
      const newId = stations.length > 0 ? Math.max(...stations.map(s => s.id)) + 1 : 1;
      setStations([...stations, { id: newId, name: formData.name, latitude: lat, longitude: lng }]);
    }
    closeModal();
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this station?')) {
      setStations(stations.filter(s => s.id !== id));
    }
  };

  const handleMapClick = (e: MapMouseEvent) => {
    if (e.detail.latLng) {
      setFormData({
        ...formData,
        latitude: e.detail.latLng.lat.toString(),
        longitude: e.detail.latLng.lng.toString(),
      });
    }
  };

  const currentLat = parseFloat(formData.latitude) || 2.929712;
  const currentLng = parseFloat(formData.longitude) || 101.641765;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Stations Management</h2>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
          Add Station
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Latitude</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Longitude</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {stations.map((station) => (
              <tr key={station.id} className="hover:bg-slate-50 transition-colors">
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{station.id}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">{station.name}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{station.latitude}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{station.longitude}</td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button onClick={() => openModal(station)} className="text-blue-600 hover:text-blue-900 mr-4 inline-flex items-center">
                    <Edit2 className="h-4 w-4 mr-1" /> Edit
                  </button>
                  <button onClick={() => handleDelete(station.id)} className="text-red-600 hover:text-red-900 inline-flex items-center">
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {stations.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">No stations found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl h-[80vh] flex flex-col transform rounded-xl bg-white shadow-2xl transition-all overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-white shrink-0">
              <h3 className="text-xl font-bold text-slate-900">{editingStation ? 'Edit Station Location' : 'Plot New Station'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex flex-1 overflow-hidden">
              {/* Left Side: Form */}
              <div className="w-1/3 p-6 border-r border-slate-200 bg-slate-50 overflow-y-auto shrink-0 flex flex-col">
                <form id="station-form" onSubmit={handleSubmit} className="space-y-6 flex-1">
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-1">Station Name</label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-[#113a9f] focus:outline-none focus:ring-1 focus:ring-[#113a9f] shadow-sm"
                      placeholder="e.g. DTC"
                    />
                  </div>
                  
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Coordinates</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Click anywhere on the map or drag the station marker to automatically update these coordinates.
                    </p>
                    <div>
                      <label htmlFor="latitude" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        id="latitude"
                        required
                        readOnly
                        value={formData.latitude}
                        className="block w-full rounded-md border-0 bg-slate-50 px-3 py-2 text-slate-600 font-mono text-sm shadow-inner"
                      />
                    </div>
                    <div>
                      <label htmlFor="longitude" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        id="longitude"
                        required
                        readOnly
                        value={formData.longitude}
                        className="block w-full rounded-md border-0 bg-slate-50 px-3 py-2 text-slate-600 font-mono text-sm shadow-inner"
                      />
                    </div>
                  </div>
                </form>

                <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="station-form"
                    className="inline-flex justify-center rounded-lg border border-transparent bg-[#113a9f] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all hover:shadow-lg"
                  >
                    {editingStation ? 'Save Station' : 'Add Station'}
                  </button>
                </div>
              </div>

              {/* Right Side: Map Plotter */}
              <div className="flex-1 relative">
                <Map
                  id={`station-map-${mapId}`}
                  defaultZoom={16}
                  defaultCenter={{ lat: currentLat, lng: currentLng }}
                  mapId={mapId}
                  disableDefaultUI={false}
                  gestureHandling="greedy"
                  onClick={handleMapClick}
                >
                  <AdvancedMarker
                    position={{ lat: currentLat, lng: currentLng }}
                    draggable={true}
                    onDragEnd={(e) => {
                      if (e.latLng) {
                        setFormData({
                          ...formData,
                          latitude: e.latLng.lat().toString(),
                          longitude: e.latLng.lng().toString(),
                        });
                      }
                    }}
                  >
                    <div className="relative flex items-center justify-center -translate-y-4">
                      <div className="absolute w-5 h-5 rounded-full bg-[#fbbf24] shadow-[0_0_0_4px_white,0_4px_6px_rgba(0,0,0,0.3)] z-10"></div>
                      {formData.name && (
                        <div className="absolute top-6 bg-white px-3 py-1.5 rounded-lg shadow-lg text-sm font-bold whitespace-nowrap z-20 text-slate-800 border border-slate-100">
                          {formData.name}
                        </div>
                      )}
                    </div>
                  </AdvancedMarker>
                </Map>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-xs font-bold text-slate-600 border border-slate-200 pointer-events-none">
                  Click map to plot station
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
