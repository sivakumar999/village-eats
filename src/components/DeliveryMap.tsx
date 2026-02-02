import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Bike, MapPin, Navigation, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const agentIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="
    background: linear-gradient(135deg, hsl(25, 95%, 53%), hsl(25, 100%, 45%));
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    border: 3px solid white;
  ">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="18.5" cy="17.5" r="3.5"/>
      <circle cx="5.5" cy="17.5" r="3.5"/>
      <circle cx="15" cy="5" r="1"/>
      <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const deliveryIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="
    background: linear-gradient(135deg, hsl(142, 76%, 36%), hsl(142, 76%, 30%));
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    border: 3px solid white;
  ">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const restaurantIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="
    background: linear-gradient(135deg, hsl(271, 91%, 65%), hsl(271, 91%, 55%));
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    border: 3px solid white;
  ">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
      <line x1="6" x2="18" y1="17" y2="17"/>
    </svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

interface AgentLocation {
  latitude: number;
  longitude: number;
  updatedAt: Date;
}

interface DeliveryMapProps {
  agentLocation: AgentLocation | null;
  deliveryAddress: string;
  restaurantName: string;
  agentName?: string;
  isLive?: boolean;
  className?: string;
}

// Component to handle map updates when agent location changes
function MapUpdater({ agentLocation, deliveryLocation }: { 
  agentLocation: AgentLocation | null; 
  deliveryLocation: [number, number];
}) {
  const map = useMap();
  
  useEffect(() => {
    if (agentLocation) {
      const bounds = L.latLngBounds([
        [agentLocation.latitude, agentLocation.longitude],
        deliveryLocation,
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [agentLocation, deliveryLocation, map]);
  
  return null;
}

// Mock coordinates for demo (Cherukupalli area in Andhra Pradesh)
const DEFAULT_CENTER: [number, number] = [16.1147, 80.8251];
const DELIVERY_LOCATION: [number, number] = [16.1147, 80.8251];
const RESTAURANT_LOCATION: [number, number] = [16.1180, 80.8300];

export function DeliveryMap({ 
  agentLocation, 
  deliveryAddress, 
  restaurantName,
  agentName,
  isLive = false,
  className 
}: DeliveryMapProps) {
  const [isMapReady, setIsMapReady] = useState(false);
  
  // Simulate agent movement for demo when no real location
  const [simulatedLocation, setSimulatedLocation] = useState<AgentLocation | null>(null);
  
  useEffect(() => {
    if (!agentLocation && isLive) {
      // Simulate agent movement for demo purposes
      const startLat = RESTAURANT_LOCATION[0];
      const startLng = RESTAURANT_LOCATION[1];
      const endLat = DELIVERY_LOCATION[0];
      const endLng = DELIVERY_LOCATION[1];
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 0.05;
        if (progress >= 1) {
          progress = 0;
        }
        
        // Add some randomness to simulate real movement
        const jitter = () => (Math.random() - 0.5) * 0.001;
        
        setSimulatedLocation({
          latitude: startLat + (endLat - startLat) * progress + jitter(),
          longitude: startLng + (endLng - startLng) * progress + jitter(),
          updatedAt: new Date(),
        });
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [agentLocation, isLive]);
  
  const activeLocation = agentLocation || simulatedLocation;

  return (
    <div className={cn("relative rounded-xl overflow-hidden border border-border", className)}>
      {/* Live indicator */}
      {isLive && (
        <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 bg-card/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-border">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-xs font-medium text-foreground">Live Tracking</span>
        </div>
      )}
      
      {/* Loading state */}
      {!isMapReady && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-muted">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      )}
      
      <MapContainer
        center={activeLocation ? [activeLocation.latitude, activeLocation.longitude] : DEFAULT_CENTER}
        zoom={15}
        style={{ height: '100%', width: '100%', minHeight: '300px' }}
        whenReady={() => setIsMapReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater 
          agentLocation={activeLocation} 
          deliveryLocation={DELIVERY_LOCATION} 
        />
        
        {/* Agent Marker */}
        {activeLocation && (
          <Marker 
            position={[activeLocation.latitude, activeLocation.longitude]}
            icon={agentIcon}
          >
            <Popup>
              <div className="text-center p-1">
                <p className="font-semibold text-sm">{agentName || 'Delivery Agent'}</p>
                <p className="text-xs text-muted-foreground">On the way</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Updated: {new Date(activeLocation.updatedAt).toLocaleTimeString()}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Restaurant Marker */}
        <Marker 
          position={RESTAURANT_LOCATION}
          icon={restaurantIcon}
        >
          <Popup>
            <div className="text-center p-1">
              <p className="font-semibold text-sm">{restaurantName}</p>
              <p className="text-xs text-muted-foreground">Pickup Point</p>
            </div>
          </Popup>
        </Marker>
        
        {/* Delivery Location Marker */}
        <Marker 
          position={DELIVERY_LOCATION}
          icon={deliveryIcon}
        >
          <Popup>
            <div className="text-center p-1">
              <p className="font-semibold text-sm">Delivery Address</p>
              <p className="text-xs text-muted-foreground">{deliveryAddress}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-card/95 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-border">
        <div className="flex flex-col gap-1.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
              <Bike className="w-2.5 h-2.5 text-primary-foreground" />
            </div>
            <span className="text-muted-foreground">Agent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
              <MapPin className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-muted-foreground">Your Location</span>
          </div>
        </div>
      </div>
    </div>
  );
}
