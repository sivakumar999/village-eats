import { Link, useLocation as useRouterLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export function CustomerHeader() {
  const { getTotalItems } = useCart();
  const { user, logout } = useAuth();
  const location = useRouterLocation();
  const totalItems = getTotalItems();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Welcome Message */}
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-hero flex items-center justify-center">
              <span className="text-xl">🍔</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm text-muted-foreground">Welcome back,</p>
              <h1 className="font-display font-bold text-foreground truncate max-w-[150px]">
                {user?.name || 'Guest'}
              </h1>
            </div>
          </div>

          {/* Center Navigation - Orders Tab */}
          <nav className="flex items-center gap-1">
            <Link to="/home">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2",
                  isActive('/home') && "bg-primary/10 text-primary"
                )}
              >
                Home
              </Button>
            </Link>
            <Link to="/my-orders">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2",
                  isActive('/my-orders') && "bg-primary/10 text-primary"
                )}
              >
                <ClipboardList className="h-4 w-4" />
                <span className="hidden sm:inline">Orders</span>
              </Button>
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center animate-cart-bounce">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Profile */}
            <Link to="/profile">
              <Button
                variant="ghost"
                size="icon"
                className={cn(isActive('/profile') && "bg-primary/10 text-primary")}
              >
                <User className="h-5 w-5" />
              </Button>
            </Link>

            {/* Logout */}
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
