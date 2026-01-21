import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Location } from '@/types';
import { locations } from '@/data/mockData';

interface LocationContextType {
  currentLocation: Location | null;
  setCurrentLocation: (location: Location) => void;
  availableLocations: Location[];
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(locations[0]);

  return (
    <LocationContext.Provider value={{
      currentLocation,
      setCurrentLocation,
      availableLocations: locations,
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
