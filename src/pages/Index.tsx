import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { CategoryFilter } from '@/components/CategoryFilter';
import { RestaurantCard } from '@/components/RestaurantCard';
import { CartSummary } from '@/components/CartSummary';
import { restaurants } from '@/data/mockData';
import { useLocation } from '@/context/LocationContext';

const Index = () => {
  const { currentLocation } = useLocation();

  // Show all restaurants - no location filtering
  const allRestaurants = restaurants;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      
      <main className="container mx-auto px-4 py-8">
        {/* Category Filter */}
        <section className="mb-8">
          <CategoryFilter />
        </section>

        {/* Restaurants Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                All Restaurants
              </h2>
              <p className="text-muted-foreground mt-1">
                {allRestaurants.length} restaurants available
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allRestaurants.map((restaurant, index) => (
              <div 
                key={restaurant.id} 
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <RestaurantCard restaurant={restaurant} />
              </div>
            ))}
          </div>

          {allRestaurants.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No restaurants available yet.
              </p>
            </div>
          )}
        </section>
      </main>

      <CartSummary />
      
      {/* Footer Spacer for Cart Summary */}
      <div className="h-24" />
    </div>
  );
};

export default Index;
