import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Clock, MapPin, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { FoodItemCard } from '@/components/FoodItemCard';
import { CartSummary } from '@/components/CartSummary';
import { getRestaurantById, getFoodItemsByRestaurant } from '@/data/mockData';

export default function RestaurantDetail() {
  const { id } = useParams<{ id: string }>();
  const restaurant = getRestaurantById(id || '');
  const foodItems = getFoodItemsByRestaurant(id || '');

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Restaurant not found</h2>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Group items by category
  const categories = [...new Set(foodItems.map(item => item.category))];
  const itemsByCategory = categories.reduce((acc, category) => {
    acc[category] = foodItems.filter(item => item.category === category);
    return acc;
  }, {} as Record<string, typeof foodItems>);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Restaurant Header */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img 
          src={restaurant.image} 
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent" />
        
        {/* Back Button */}
        <Link 
          to="/"
          className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-card transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Link>
        
        {/* Share Button */}
        <Button 
          variant="ghost" 
          size="icon"
          className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-full shadow-md hover:bg-card"
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Restaurant Info */}
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                {restaurant.name}
              </h1>
              <p className="text-muted-foreground mt-1">
                {restaurant.cuisine.join(' • ')}
              </p>
            </div>
            
            {/* Rating Badge */}
            <div className="flex items-center gap-1.5 bg-accent px-3 py-1.5 rounded-lg">
              <Star className="h-4 w-4 text-accent-foreground fill-accent-foreground" />
              <span className="font-bold text-accent-foreground">{restaurant.rating}</span>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{restaurant.deliveryTime}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{restaurant.distance} km away</span>
            </div>
            <span className="text-sm text-muted-foreground">{restaurant.priceRange}</span>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <main className="container mx-auto px-4 py-8">
        {categories.map((category) => (
          <section key={category} className="mb-8">
            <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              {category}
              <span className="text-sm font-normal text-muted-foreground">
                ({itemsByCategory[category].length})
              </span>
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {itemsByCategory[category].map((item, index) => (
                <div 
                  key={item.id}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <FoodItemCard item={item} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      <CartSummary distance={restaurant.distance} />
      
      {/* Footer Spacer */}
      <div className="h-24" />
    </div>
  );
}
