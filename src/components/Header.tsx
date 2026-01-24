import { MapPin, ShoppingCart, Search, ChevronDown, User, ClipboardList, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import { useOrders } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { getTotalItems } = useCart();
  const { currentLocation, setCurrentLocation, availableLocations } = useLocation();
  const { orders } = useOrders();
  const { user, isAuthenticated, logout } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const totalItems = getTotalItems();
  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-hero flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">🍔</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display text-xl font-bold text-foreground">Village Eats</h1>
              <p className="text-xs text-muted-foreground">Fresh & Fast Delivery</p>
            </div>
          </Link>

          {/* Location Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 max-w-[200px]">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate font-medium">{currentLocation?.name || 'Select Location'}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-card border border-border z-50">
              {availableLocations.map(location => (
                <DropdownMenuItem 
                  key={location.id}
                  onClick={() => setCurrentLocation(location)}
                  className="cursor-pointer hover:bg-muted"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{location.name}</span>
                    {location.distance > 0 && (
                      <span className="text-xs text-muted-foreground">{location.distance} km</span>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for restaurants or dishes..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted border-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* My Orders - only show when authenticated */}
            {isAuthenticated && (
              <Link to="/my-orders">
                <Button variant="ghost" size="icon" className="relative">
                  <ClipboardList className="h-5 w-5" />
                  {activeOrders > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                      {activeOrders}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {/* User Menu / Auth Buttons */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border border-border z-50">
                  <div className="px-3 py-2">
                    <p className="font-medium text-foreground truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/dashboard" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      My Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/my-orders" className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={logout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                  <Button variant="ghost" size="icon" className="sm:hidden">
                    <LogIn className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/register" className="hidden sm:block">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Cart */}
            <Link to="/cart">
              <Button variant="cart" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center animate-cart-bounce">
                    {totalItems}
                  </span>
                )}
                <span className="hidden sm:inline ml-1">Cart</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden mt-3 animate-slide-up">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for restaurants or dishes..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted border-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
