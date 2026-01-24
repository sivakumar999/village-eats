import { Link } from 'react-router-dom';
import { ShoppingBag, Clock, MapPin, ChevronRight, UtensilsCrossed, Package, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { useOrders } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  placed: 'bg-warning/20 text-warning-foreground',
  accepted: 'bg-primary/20 text-primary',
  preparing: 'bg-accent/20 text-accent-foreground',
  on_the_way: 'bg-primary/20 text-primary',
  delivered: 'bg-veg/20 text-veg',
  cancelled: 'bg-destructive/20 text-destructive',
};

const statusLabels: Record<string, string> = {
  placed: 'Order Placed',
  accepted: 'Accepted',
  preparing: 'Preparing',
  on_the_way: 'On the Way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { orders } = useOrders();
  const { currentLocation } = useLocation();

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'delivered');
  const totalSpent = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0] || 'Guest'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            <MapPin className="inline h-4 w-4 mr-1" />
            Delivering to {currentLocation?.name || 'your location'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{activeOrders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4" />
                Delivered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-veg">{completedOrders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Star className="h-4 w-4" />
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalSpent}</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-foreground">Active Orders</h2>
              <Link to="/my-orders" className="text-sm text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {activeOrders.slice(0, 3).map(order => (
                <Link 
                  key={order.id} 
                  to={`/order/${order.id}`}
                  className="block bg-card rounded-xl shadow-card p-4 hover:shadow-lg transition-shadow border-l-4 border-primary"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          statusColors[order.status]
                        )}>
                          {statusLabels[order.status]}
                        </span>
                        <span className="text-xs text-muted-foreground">#{order.orderNumber}</span>
                      </div>
                      <h3 className="font-semibold text-foreground truncate">
                        {order.restaurantName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''} • ₹{order.totalAmount}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recent Orders */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">Recent Orders</h2>
            <Link to="/my-orders" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>

          {orders.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">
                  No orders yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Place your first order to see it here
                </p>
                <Link to="/">
                  <Button>Browse Restaurants</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map(order => (
                <Link 
                  key={order.id} 
                  to={`/order/${order.id}`}
                  className="block bg-card rounded-xl shadow-card p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          statusColors[order.status]
                        )}>
                          {statusLabels[order.status]}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground truncate">
                        {order.restaurantName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''} • ₹{order.totalAmount}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {order.placedAt.toLocaleDateString()} at {order.placedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <UtensilsCrossed className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-semibold text-foreground">Order Food</p>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    Browse restaurants near you
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/my-orders">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                    <Package className="h-6 w-6 text-accent" />
                  </div>
                  <p className="font-semibold text-foreground">My Orders</p>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    View order history
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
