import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Clock, CheckCircle } from 'lucide-react';
import { CustomerHeader } from '@/components/CustomerHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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

export default function CustomerOrders() {
  const { orders } = useOrders();
  const [activeTab, setActiveTab] = useState('pending');

  const pendingOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const completedOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));

  const renderOrderList = (orderList: typeof orders, emptyMessage: string) => {
    if (orderList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-center">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {orderList.map(order => (
          <Link
            key={order.id}
            to={`/order/${order.id}`}
            className="block bg-card rounded-xl shadow-card p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Status Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    statusColors[order.status]
                  )}>
                    {statusLabels[order.status]}
                  </span>
                  {order.agentName && order.status !== 'placed' && (
                    <span className="text-xs text-muted-foreground">
                      by {order.agentName}
                    </span>
                  )}
                </div>

                {/* Restaurant Name */}
                <h3 className="font-semibold text-foreground truncate mb-1">
                  {order.restaurantName}
                </h3>

                {/* Items */}
                <p className="text-sm text-muted-foreground mb-1">
                  {order.items.map(item => `${item.quantity}x ${item.foodItemName}`).join(', ')}
                </p>

                {/* Price and Date */}
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-medium text-primary">₹{order.totalAmount}</span>
                  <span className="text-muted-foreground">
                    {order.placedAt.toLocaleDateString()} at {order.placedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-2" />
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <CustomerHeader />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="font-display text-2xl font-bold text-foreground mb-6">My Orders</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending
              {pendingOrders.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {pendingOrders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed
              {completedOrders.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {completedOrders.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {renderOrderList(pendingOrders, "No pending orders. Your active orders will appear here.")}
          </TabsContent>

          <TabsContent value="completed">
            {renderOrderList(completedOrders, "No completed orders yet. Your delivered orders will appear here.")}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
