import { ShoppingBag, IndianRupee, TrendingUp, Clock, MapPin, Star, Package, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Mock stats - replace with API
const stats = { 
  todayDeliveries: 5, 
  todayEarnings: 345, 
  pendingOrders: 3, 
  weekEarnings: 2420,
  totalDeliveries: 127,
  rating: 4.8,
  weeklyTarget: 40,
  weeklyCompleted: 28,
};

const recentDeliveries = [
  { id: 'VE202401150001', restaurant: 'Biryani House', customer: 'Ravi Kumar', amount: 45, status: 'delivered', time: '15 mins ago' },
  { id: 'VE202401150002', restaurant: 'Spice Garden', customer: 'Lakshmi Devi', amount: 52, status: 'delivered', time: '1 hour ago' },
  { id: 'VE202401150003', restaurant: 'Royal Dhaba', customer: 'Venkat Reddy', amount: 38, status: 'delivered', time: '2 hours ago' },
];

const pendingPickups = [
  { id: 'VE202401150004', restaurant: 'Kavuru Kitchen', location: 'Kavuru', distance: '1.2 km', earning: 35 },
  { id: 'VE202401150005', restaurant: 'Taste of Village', location: 'Pedavadlapudi', distance: '2.5 km', earning: 48 },
];

export default function AgentDashboard() {
  const weeklyProgress = (stats.weeklyCompleted / stats.weeklyTarget) * 100;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Welcome, Raju! 👋</h1>
        <p className="text-muted-foreground flex items-center gap-1 mt-1">
          <MapPin className="h-4 w-4" />
          Kavuru Area • Active Now
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
            <div className="text-2xl font-bold">{stats.todayDeliveries}</div>
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
            <div className="text-2xl font-bold text-veg">₹{stats.todayEarnings}</div>
            <p className="text-xs text-muted-foreground">+₹45 last delivery</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">orders nearby</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Star className="h-4 w-4" />
              Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rating}</div>
            <p className="text-xs text-muted-foreground">{stats.totalDeliveries} deliveries</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Weekly Progress</CardTitle>
            <span className="text-sm font-bold text-primary">{stats.weeklyCompleted}/{stats.weeklyTarget}</span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={weeklyProgress} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>₹{stats.weekEarnings} earned this week</span>
            <span>{stats.weeklyTarget - stats.weeklyCompleted} left for bonus</span>
          </div>
        </CardContent>
      </Card>

      {/* Pending Pickups */}
      {pendingPickups.length > 0 && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Available Pickups
            </CardTitle>
            <CardDescription>Accept orders to start earning</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingPickups.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div>
                  <p className="font-medium text-foreground">{order.restaurant}</p>
                  <p className="text-sm text-muted-foreground">
                    <MapPin className="inline h-3 w-3 mr-1" />
                    {order.location} • {order.distance}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-veg">₹{order.earning}</p>
                  <p className="text-xs text-muted-foreground">earning</p>
                </div>
              </div>
            ))}
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

      {/* Recent Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Deliveries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentDeliveries.map((delivery) => (
            <div key={delivery.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="font-medium text-foreground">{delivery.restaurant}</p>
                <p className="text-sm text-muted-foreground">{delivery.customer} • {delivery.time}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-veg">+₹{delivery.amount}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
