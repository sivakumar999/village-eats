import { Star, Clock, MapPin } from 'lucide-react';
import { Restaurant } from '@/types';
import { Link } from 'react-router-dom';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link 
      to={`/restaurant/${restaurant.id}`}
      className="group block"
    >
      <div className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative h-44 overflow-hidden">
          <img 
            src={restaurant.image} 
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
          
          {/* Status Badge */}
          {!restaurant.isOpen && (
            <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
              <span className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-semibold">
                Closed
              </span>
            </div>
          )}
          
          {/* Delivery Time */}
          <div className="absolute bottom-3 left-3 bg-card/95 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium">{restaurant.deliveryTime}</span>
          </div>

          {/* Distance Badge */}
          {restaurant.distance !== undefined && restaurant.distance > 0 && (
            <div className="absolute bottom-3 right-3 bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
              <MapPin className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{restaurant.distance} km</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                {restaurant.name}
              </h3>
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {restaurant.cuisine.join(' • ')}
              </p>
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-1 bg-accent/10 px-2.5 py-1 rounded-lg shrink-0">
              <Star className="h-4 w-4 text-accent fill-accent" />
              <span className="text-sm font-semibold text-accent">{restaurant.rating}</span>
            </div>
          </div>
          
          {/* Price Range */}
          <div className="mt-3 pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground">{restaurant.priceRange}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
