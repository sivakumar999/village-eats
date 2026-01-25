import { User, Mail, Phone, MapPin, Package, Star, IndianRupee } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function AgentProfile() {
  const { user } = useAuth();

  // Mock stats
  const stats = {
    totalDeliveries: 127,
    totalEarnings: 12450,
    rating: 4.8,
    joinedDate: 'Jan 2024',
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Profile Header */}
      <div className="text-center">
        <div className="h-24 w-24 rounded-full bg-gradient-hero flex items-center justify-center mx-auto mb-4">
          <User className="h-12 w-12 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          {user?.name || 'Agent'}
        </h1>
        <p className="text-muted-foreground">Delivery Partner since {stats.joinedDate}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.totalDeliveries}</p>
            <p className="text-xs text-muted-foreground">Deliveries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <IndianRupee className="h-6 w-6 text-veg mx-auto mb-2" />
            <p className="text-2xl font-bold">₹{stats.totalEarnings}</p>
            <p className="text-xs text-muted-foreground">Earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.rating}</p>
            <p className="text-xs text-muted-foreground">Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Details */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="font-display font-bold text-foreground">Profile Details</h2>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Full Name</p>
              <p className="font-medium">{user?.name || 'Not set'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email || 'Not set'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Phone className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Mobile Number</p>
              <p className="font-medium">{user?.phone || 'Not set'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <MapPin className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Service Area</p>
              <p className="font-medium">{user?.address || 'Kavuru, Cherukupalli'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full">
        Edit Profile
      </Button>
    </div>
  );
}
