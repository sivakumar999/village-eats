import { Link } from 'react-router-dom';
import { LogIn, UserPlus, Utensils, Truck, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <div className="mb-8 text-center animate-fade-in">
          <div className="h-24 w-24 rounded-2xl bg-gradient-hero flex items-center justify-center mx-auto mb-4 shadow-xl">
            <span className="text-5xl">🍔</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">
            Village Eats
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl">
            Fresh & Fast Delivery to Your Doorstep
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 max-w-md mb-12">
          <div className="bg-card rounded-xl p-4 shadow-card text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Utensils className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">Local Restaurants</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card text-center">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
              <Truck className="h-6 w-6 text-accent-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Quick Delivery</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card text-center">
            <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-2">
              <Clock className="h-6 w-6 text-secondary-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Real-time Tracking</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">Village Coverage</p>
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <Link to="/login" className="flex-1">
            <Button variant="outline" size="xl" className="w-full gap-2">
              <LogIn className="h-5 w-5" />
              Sign In
            </Button>
          </Link>
          <Link to="/register" className="flex-1">
            <Button variant="hero" size="xl" className="w-full gap-2">
              <UserPlus className="h-5 w-5" />
              Sign Up
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-border">
        <p className="text-sm text-muted-foreground">
          © 2024 Village Eats. Serving fresh food to your village.
        </p>
      </footer>
    </div>
  );
}
