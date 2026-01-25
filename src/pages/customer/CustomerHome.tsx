import { CustomerHeader } from '@/components/CustomerHeader';
import { CategoryFilter } from '@/components/CategoryFilter';
import { RestaurantCard } from '@/components/RestaurantCard';
import { CartSummary } from '@/components/CartSummary';
import { restaurants } from '@/data/mockData';
import { useLocation } from '@/context/LocationContext';
import { MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function CustomerHome() {
  const { currentLocation, setCurrentLocation, availableLocations } = useLocation();

  // Filter restaurants by selected location
  const filteredRestaurants = currentLocation
    ? restaurants.filter(r => r.locationId === currentLocation.id)
    : restaurants;

  return (
    <div className="min-h-screen bg-background">
      <CustomerHeader />

      <main className="container mx-auto px-4 py-6">
        {/* Location Selector */}
        <section className="mb-6">
          <div className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Location</p>
                  <p className="font-display font-bold text-foreground">
                    {currentLocation?.name || 'Select Location'}
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    Change
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border border-border z-50">
                  {availableLocations.map(location => (
                    <DropdownMenuItem
                      key={location.id}
                      onClick={() => setCurrentLocation(location)}
                      className="cursor-pointer hover:bg-muted"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{location.name}</span>
                        {location.id === currentLocation?.id && (
                          <span className="text-xs text-primary">✓</span>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="mb-6">
          <CategoryFilter />
        </section>

        {/* Restaurants Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Restaurants in {currentLocation?.name || 'Your Area'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>

          {filteredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant, index) => (
                <div
                  key={restaurant.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <RestaurantCard restaurant={restaurant} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-xl">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg mb-2">
                No restaurants in this location yet
              </p>
              <p className="text-sm text-muted-foreground">
                Try selecting a different delivery location
              </p>
            </div>
          )}
        </section>
      </main>

      <CartSummary />
      <div className="h-24" />
    </div>
  );
}
