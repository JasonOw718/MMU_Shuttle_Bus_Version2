import { createContext, useContext, useState, type ReactNode } from 'react';

export interface Station {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export interface Route {
  id: number;
  name: string;
  total_station: number;
  route_lines: string; // JSON string
  stationIds: number[];
  stationSchedules: { stationId: number; timeSlots: string[] }[]; // Added to track schedules per station
}

export interface Driver {
  id: number;
  email: string;
  bus_plate: string;
}

interface MockDataContextType {
  stations: Station[];
  setStations: React.Dispatch<React.SetStateAction<Station[]>>;
  routes: Route[];
  setRoutes: React.Dispatch<React.SetStateAction<Route[]>>;
  drivers: Driver[];
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const MockDataContext = createContext<MockDataContextType | undefined>(undefined);

export function MockDataProvider({ children }: { children: ReactNode }) {
  const [stations, setStations] = useState<Station[]>([
    { id: 1, name: 'DTC', latitude: 2.929712, longitude: 101.641765 }
  ]);

  const [routes, setRoutes] = useState<Route[]>([
    {
      id: 1,
      name: 'DTC → Mutiara Ville',
      total_station: 1,
      route_lines: '[\n  {\n    "longitude": 101.641765,\n    "latitude": 2.929712\n  }\n]',
      stationIds: [1],
      stationSchedules: []
    },
  ]);

  const [drivers, setDrivers] = useState<Driver[]>([
    { id: 1, email: 'driver1@gmail.com', bus_plate: 'WPE 3575' },
  ]);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  return (
    <MockDataContext.Provider value={{ 
      stations, setStations, 
      routes, setRoutes, 
      drivers, setDrivers,
      isAuthenticated, setIsAuthenticated
    }}>
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  const context = useContext(MockDataContext);
  if (context === undefined) {
    throw new Error('useMockData must be used within a MockDataProvider');
  }
  return context;
}
