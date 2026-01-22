import { Link } from 'react-router-dom';
import { ArrowLeft, Package, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrders } from '@/context/OrderContext';
import { cn } from '@/lib/utils';

const statusColors = {
  placed: 'bg-warning/20 text-warning-foreground',
  accepted: 'bg-primary/20 text-primary',
  preparing: 'bg-accent/20 text-accent-foreground',
  on_the_way: 'bg-primary/20 text-primary',
  delivered: 'bg-veg/20 text-veg',
  cancelled: 'bg-destructive/20 text-destructive',
};

const statusLabels = {
  placed: 'Order Placed',
  accepted: 'Accepted',
  preparing: 'Preparing',
  on_the_way: 'On the Way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function MyOrders() {
  const { orders } = useOrders();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 rounded-full hover:bg-muted transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-display text-xl font-bold">My Orders</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">
              No orders yet
            </h2>
            <p className="text-muted-foreground text-center mb-6">
              Place your first order to see it here
            </p>
            <Link to="/">
              <Button variant="hero">Browse Restaurants</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Link 
                key={order.id} 
                to={`/order/${order.id}`}
                className="block bg-card rounded-xl shadow-card p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
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
      </main>
    </div>
  );
}
