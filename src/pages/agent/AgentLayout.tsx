import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, IndianRupee, LogOut, Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/agent', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/agent/orders', label: 'Available Orders', icon: ShoppingBag },
  { path: '/agent/earnings', label: 'My Earnings', icon: IndianRupee },
];

export default function AgentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string, end?: boolean) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Welcome Message */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-hero flex items-center justify-center">
              <span className="text-xl">🚴</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-muted-foreground">Welcome our member,</p>
              <h1 className="font-display font-bold text-foreground">
                {user?.name || 'Agent'}
              </h1>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Right: Profile & Logout (Desktop) */}
          <div className="hidden lg:flex items-center gap-2">
            <Link to="/agent/profile">
              <Button
                variant="ghost"
                size="sm"
                className={cn("gap-2", isActive('/agent/profile') && "bg-primary/10 text-primary")}
              >
                <User className="h-4 w-4" />
                Profile
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex px-4 pb-3 gap-2 border-t border-border pt-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                isActive(item.path, item.end) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              )}>
              <item.icon className="h-4 w-4" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-foreground/20" onClick={() => setSidebarOpen(false)}>
          <nav className="absolute top-16 left-0 right-0 bg-card border-b p-4 space-y-2" onClick={e => e.stopPropagation()}>
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={cn("flex items-center gap-3 px-4 py-3 rounded-lg",
                  isActive(item.path, item.end) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                )}>
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
            <div className="border-t border-border pt-3 mt-3 space-y-2">
              <Link to="/agent/profile" onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
              <button
                onClick={() => { logout(); setSidebarOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 w-full"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      <main className="p-4 lg:p-6 max-w-5xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
