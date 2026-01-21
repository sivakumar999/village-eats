import { useState } from 'react';
import { MapPin, Clock, IndianRupee, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const pendingOrders = [
  { id: '1', orderNumber: 'VE202401150004', restaurant: 'Spice Garden', location: 'Cherukupalli', customer: 'Main Road', distance: 0, items: 2, earning: 25 },
  { id: '2', orderNumber: 'VE202401150005', restaurant: 'Taste of Village', location: 'Kavuru', customer: 'Temple Street', distance: 2, items: 1, earning: 38 },
];

export default function AgentOrders() {
  const [orders, setOrders] = useState(pendingOrders);
  const { toast } = useToast();

  const acceptOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    toast({ title: "Order Accepted!", description: "Navigate to the restaurant to pick up." });
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-2">Available Orders</h1>
      <p className="text-muted-foreground mb-6">{orders.length} orders in your area</p>
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">{order.restaurant}</p>
                </div>
                <Badge variant="outline" className="bg-accent/20">{order.items} items</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{order.location}</span>
                {order.distance > 0 && <span>{order.distance} km</span>}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-lg font-bold text-primary">
                  <IndianRupee className="h-4 w-4" />₹{order.earning}
                </div>
                <Button onClick={() => acceptOrder(order.id)}>Accept Order</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {orders.length === 0 && <p className="text-center py-12 text-muted-foreground">No orders available right now</p>}
      </div>
    </div>
  );
}
