import { ShoppingBag, IndianRupee, TrendingUp, Clock, MapPin, Star, Package, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrderContext';

export default function AgentDashboard() {
  const { user } = useAuth();
  const { orders } = useOrders();

  // Calculate real stats from context
  const allAgentOrders = orders.filter(o => o.agentId === user?.id);
  const deliveredOrders = allAgentOrders.filter(o => o.status === 'delivered');
  const pendingOrders = orders.filter(o => o.status === 'placed' && !o.agentId);
  
  const todayDeliveries = deliveredOrders.length;
  const todayEarnings = deliveredOrders.reduce((sum, o) => sum + (o.deliveryBaseFee + o.deliveryDistanceFee - o.multiItemDiscount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Welcome, {user?.name || 'Agent'}! 👋</h1>
        <p className="text-muted-foreground flex items-center gap-1 mt-1">
          <MapPin className="h-4 w-4" />
          {user?.locationName || 'Your Area'} • Active Now
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayDeliveries}</div>
            <p className="text-xs text-muted-foreground">deliveries completed</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-veg/10 to-veg/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Earned Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-veg">₹{todayEarnings}</div>
            <p className="text-xs text-muted-foreground">from deliveries</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{pendingOrders.length}</div>
            <p className="text-xs text-muted-foreground">orders to accept</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Star className="h-4 w-4" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allAgentOrders.length}</div>
            <p className="text-xs text-muted-foreground">all time orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Available Orders Preview */}
      {pendingOrders.length > 0 && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              New Orders Available
            </CardTitle>
            <CardDescription>{pendingOrders.length} orders waiting for acceptance</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/agent/orders">
              <Button className="w-full" size="lg">
                <ShoppingBag className="h-5 w-5 mr-2" />
                View & Accept Orders
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/agent/orders" className="block">
          <Button className="w-full h-14" size="lg">
            <ShoppingBag className="h-5 w-5 mr-2" />
            View Orders
          </Button>
        </Link>
        <Link to="/agent/earnings" className="block">
          <Button variant="outline" className="w-full h-14" size="lg">
            <TrendingUp className="h-5 w-5 mr-2" />
            Earnings
          </Button>
        </Link>
      </div>

      {/* Recent Deliveries from context */}
      {deliveredOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Deliveries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {deliveredOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-foreground">{order.restaurantName}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.items.map(i => i.foodItemName).join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-veg">+₹{order.deliveryBaseFee}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
