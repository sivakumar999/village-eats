import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOrders } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import { IndianRupee, Package, Calendar } from 'lucide-react';

export default function AgentEarnings() {
  const { orders } = useOrders();
  const { user } = useAuth();
  const [period, setPeriod] = useState('today');

  const myDelivered = orders.filter(o => o.agentId === user?.id && o.status === 'delivered');
  
  const totalEarnings = myDelivered.reduce((sum, o) => sum + (o.deliveryBaseFee + o.deliveryDistanceFee - o.multiItemDiscount), 0);
  const totalDeliveries = myDelivered.length;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">My Earnings</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <IndianRupee className="h-6 w-6 text-veg mx-auto mb-2" />
            <p className="text-2xl font-bold text-veg">₹{totalEarnings}</p>
            <p className="text-xs text-muted-foreground">Total Earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{totalDeliveries}</p>
            <p className="text-xs text-muted-foreground">Deliveries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <IndianRupee className="h-6 w-6 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold">₹{totalDeliveries > 0 ? Math.round(totalEarnings / totalDeliveries) : 0}</p>
            <p className="text-xs text-muted-foreground">Avg/Order</p>
          </CardContent>
        </Card>
      </div>

      {/* Period Filter */}
      <Tabs value={period} onValueChange={setPeriod}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="today" className="gap-2">
            <Calendar className="h-4 w-4" /> Today
          </TabsTrigger>
          <TabsTrigger value="week" className="gap-2">
            <Calendar className="h-4 w-4" /> This Week
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              {myDelivered.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No deliveries today yet</p>
              ) : (
                <div className="space-y-3">
                  {myDelivered.map((order) => (
                    <div key={order.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium text-foreground">{order.restaurantName}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.items.map(i => i.foodItemName).join(', ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.deliveredAt ? new Date(order.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                      </div>
                      <p className="font-bold text-veg">+₹{order.deliveryBaseFee}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">This Week's Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              {myDelivered.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No deliveries this week</p>
              ) : (
                <div className="space-y-3">
                  {myDelivered.map((order) => (
                    <div key={order.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium text-foreground">{order.restaurantName}</p>
                        <p className="text-sm text-muted-foreground">{order.customerName}</p>
                      </div>
                      <p className="font-bold text-veg">+₹{order.deliveryBaseFee}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
