import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  Store, 
  UtensilsCrossed, 
  Users, 
  ShoppingBag,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/admin/locations', label: 'Locations', icon: MapPin },
  { path: '/admin/restaurants', label: 'Restaurants', icon: Store },
  { path: '/admin/menu-items', label: 'Menu Items', icon: UtensilsCrossed },
  { path: '/admin/agents', label: 'Agents', icon: Users },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string, end?: boolean) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="text-xl">🍔</span>
            <span className="font-display font-bold text-primary">Admin</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Logo */}
          <div className="hidden lg:flex items-center gap-2 px-6 py-5 border-b border-border">
            <span className="text-2xl">🍔</span>
            <div>
              <span className="font-display font-bold text-primary">Village Eats</span>
              <span className="block text-xs text-muted-foreground">Admin Panel</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1 mt-4 lg:mt-0">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive(item.path, item.end)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
            <Link to="/">
              <Button variant="outline" className="w-full justify-start gap-2">
                <LogOut className="h-4 w-4" />
                Exit Admin
              </Button>
            </Link>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-foreground/20 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen lg:min-h-[calc(100vh)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
