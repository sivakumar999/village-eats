import { 
  ShoppingBag, 
  Users, 
  Store, 
  TrendingUp,
  IndianRupee,
  ArrowUpRight,
  Package,
  Truck,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Mock dashboard data - replace with API calls
const stats = {
  totalOrders: 1247,
  todayOrders: 34,
  totalRevenue: 287450,
  todayRevenue: 8750,
  totalCustomers: 423,
  totalAgents: 12,
  activeAgents: 8,
  pendingOrders: 5,
  totalRestaurants: 15,
};

const recentOrders = [
  { id: 'VE202401150001', customer: 'Ravi Kumar', restaurant: 'Biryani House', amount: 380, status: 'delivered', time: '10 mins ago' },
  { id: 'VE202401150002', customer: 'Lakshmi Devi', restaurant: 'Spice Garden', amount: 520, status: 'on_the_way', time: '25 mins ago' },
  { id: 'VE202401150003', customer: 'Venkat Reddy', restaurant: 'Royal Dhaba', amount: 290, status: 'preparing', time: '32 mins ago' },
  { id: 'VE202401150004', customer: 'Sita Rani', restaurant: 'Kavuru Kitchen', amount: 450, status: 'placed', time: '45 mins ago' },
  { id: 'VE202401150005', customer: 'Prasad Rao', restaurant: 'Taste of Village', amount: 340, status: 'accepted', time: '52 mins ago' },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  placed: { label: 'Placed', className: 'bg-warning/20 text-warning-foreground' },
  accepted: { label: 'Accepted', className: 'bg-primary/20 text-primary' },
  preparing: { label: 'Preparing', className: 'bg-accent/20 text-accent-foreground' },
  on_the_way: { label: 'On the Way', className: 'bg-primary/20 text-primary' },
  delivered: { label: 'Delivered', className: 'bg-veg/20 text-veg' },
  cancelled: { label: 'Cancelled', className: 'bg-destructive/20 text-destructive' },
};

const quickLinks = [
  { to: '/admin/orders', icon: ShoppingBag, label: 'Manage Orders', count: stats.pendingOrders },
  { to: '/admin/restaurants', icon: Store, label: 'Restaurants', count: stats.totalRestaurants },
  { to: '/admin/agents', icon: Truck, label: 'Delivery Agents', count: stats.activeAgents },
  { to: '/admin/locations', icon: Package, label: 'Locations', count: null },
];

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOrders}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-veg" />
              <span className="text-veg">12%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-veg/10 to-veg/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-veg" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.todayRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-veg" />
              <span className="text-veg">8%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAgents}<span className="text-muted-foreground text-lg">/{stats.totalAgents}</span></div>
            <p className="text-xs text-muted-foreground mt-1">
              <Clock className="inline h-3 w-3 mr-1" />
              {stats.pendingOrders} orders pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(stats.totalRevenue / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalOrders.toLocaleString()} total orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <Link key={link.to} to={link.to}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <link.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{link.label}</p>
                  {link.count !== null && (
                    <p className="text-xs text-muted-foreground">{link.count} active</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <CardDescription>Latest orders from all restaurants</CardDescription>
          </div>
          <Link to="/admin/orders">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.customer} • {order.restaurant}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">₹{order.amount}</p>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    statusConfig[order.status].className
                  )}>
                    {statusConfig[order.status].label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
