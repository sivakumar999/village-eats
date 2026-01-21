import { MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from '@/context/LocationContext';

export function HeroSection() {
  const { currentLocation } = useLocation();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12 md:py-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary/20 rounded-full blur-2xl" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-2xl mx-auto text-center">
          {/* Location Badge */}
          <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-6 animate-slide-up">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              Delivering to <span className="text-primary font-semibold">{currentLocation?.name}</span>
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Delicious Food
            <br />
            <span className="text-gradient-primary">Delivered Fresh</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            From your favorite local restaurants to your doorstep.
            <br className="hidden sm:block" />
            Fast, fresh, and always on time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Button variant="hero" size="xl">
              Order Now
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg">
              Explore Restaurants
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-12 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <p className="font-display text-2xl md:text-3xl font-bold text-primary">20+</p>
              <p className="text-sm text-muted-foreground">Restaurants</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="font-display text-2xl md:text-3xl font-bold text-primary">500+</p>
              <p className="text-sm text-muted-foreground">Dishes</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="font-display text-2xl md:text-3xl font-bold text-primary">25min</p>
              <p className="text-sm text-muted-foreground">Avg. Delivery</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
