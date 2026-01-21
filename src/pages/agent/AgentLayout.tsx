import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, IndianRupee, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/agent', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/agent/orders', label: 'Available Orders', icon: ShoppingBag },
  { path: '/agent/earnings', label: 'My Earnings', icon: IndianRupee },
];

export default function AgentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string, end?: boolean) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/agent" className="flex items-center gap-2">
            <span className="text-xl">🚴</span>
            <span className="font-display font-bold text-primary">Agent Portal</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        <nav className="hidden lg:flex px-4 pb-2 gap-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                isActive(item.path, item.end) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              )}>
              <item.icon className="h-4 w-4" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
          <Link to="/" className="ml-auto">
            <Button variant="ghost" size="sm"><LogOut className="h-4 w-4 mr-1" />Exit</Button>
          </Link>
        </nav>
      </header>
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-foreground/20" onClick={() => setSidebarOpen(false)}>
          <nav className="absolute top-16 left-0 right-0 bg-card border-b p-4 space-y-2">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={cn("flex items-center gap-2 px-4 py-3 rounded-lg",
                  isActive(item.path, item.end) ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}>
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
      <main className="p-4 lg:p-6"><Outlet /></main>
    </div>
  );
}
