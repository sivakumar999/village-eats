import { Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, MapPin, ShoppingBag, Edit2 } from 'lucide-react';
import { CustomerHeader } from '@/components/CustomerHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrderContext';

export default function CustomerProfile() {
  const { user } = useAuth();
  const { orders } = useOrders();

  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const totalSpent = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="min-h-screen bg-background">
      <CustomerHeader />

      <main className="container mx-auto px-4 py-6 max-w-lg">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="h-24 w-24 rounded-full bg-gradient-hero flex items-center justify-center mx-auto mb-4">
            <User className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {user?.name || 'Guest User'}
          </h1>
          <p className="text-muted-foreground">Customer since 2024</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="h-10 w-10 rounded-full bg-veg/10 flex items-center justify-center mx-auto mb-2">
                <span className="text-veg font-bold">✓</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{deliveredOrders}</p>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
                <span className="text-accent-foreground font-bold">₹</span>
              </div>
              <p className="text-2xl font-bold text-foreground">₹{totalSpent}</p>
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-foreground">Profile Details</h2>
              <Button variant="ghost" size="sm" className="gap-1">
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="font-medium text-foreground">{user?.name || 'Not set'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Email (Optional)</p>
                  <p className="font-medium text-foreground">{user?.email || 'Not set'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Mobile Number</p>
                  <p className="font-medium text-foreground">{user?.phone || 'Not set'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Delivery Address</p>
                  <p className="font-medium text-foreground">{user?.address || 'Not set'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Link to="/my-orders" className="block">
            <Button variant="outline" className="w-full justify-start gap-3">
              <ShoppingBag className="h-5 w-5" />
              View All Orders
            </Button>
          </Link>
          <Link to="/home" className="block">
            <Button variant="hero" className="w-full">
              Order Food
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
