import { useState } from 'react';
import { MapPin, IndianRupee, Package, AlertTriangle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  orderNumber: string;
  restaurant: string;
  location: string;
  customer: string;
  customerAddress: string;
  distance: number;
  items: { name: string; qty: number }[];
  earning: number;
  status: 'available' | 'accepted' | 'preparing' | 'picked' | 'delivered';
}

const initialAvailableOrders: Order[] = [
  { 
    id: '1', orderNumber: 'VE202401150004', restaurant: 'Spice Garden', location: 'Cherukupalli', 
    customer: 'Ravi Kumar', customerAddress: 'Main Road, Near Temple', distance: 0, 
    items: [{ name: 'Butter Chicken', qty: 1 }, { name: 'Naan', qty: 2 }], earning: 25, status: 'available'
  },
  { 
    id: '2', orderNumber: 'VE202401150005', restaurant: 'Taste of Village', location: 'Kavuru',
    customer: 'Lakshmi Devi', customerAddress: 'Temple Street, House 45', distance: 2,
    items: [{ name: 'Veg Biryani', qty: 1 }], earning: 38, status: 'available'
  },
  { 
    id: '3', orderNumber: 'VE202401150006', restaurant: 'Royal Dhaba', location: 'Pedavadlapudi',
    customer: 'Venkat Reddy', customerAddress: 'School Road', distance: 3,
    items: [{ name: 'Paneer Masala', qty: 1 }, { name: 'Roti', qty: 4 }], earning: 47, status: 'available'
  },
];

const statusOptions = [
  { value: 'accepted', label: 'Accepted', color: 'bg-primary/20 text-primary' },
  { value: 'preparing', label: 'Preparing in Restaurant', color: 'bg-warning/20 text-warning-foreground' },
  { value: 'picked', label: 'In Delivery Route', color: 'bg-accent/20 text-accent-foreground' },
  { value: 'delivered', label: 'Delivered', color: 'bg-veg/20 text-veg' },
];

export default function AgentOrders() {
  const [availableOrders, setAvailableOrders] = useState<Order[]>(initialAvailableOrders);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('available');
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; order: Order | null }>({ open: false, order: null });
  const [cancelReason, setCancelReason] = useState('');
  const { toast } = useToast();

  const acceptOrder = (order: Order) => {
    setAvailableOrders(prev => prev.filter(o => o.id !== order.id));
    setMyOrders(prev => [...prev, { ...order, status: 'accepted' }]);
    setActiveTab('my-orders');
    toast({ 
      title: "Order Accepted!", 
      description: `Order ${order.orderNumber} - Navigate to ${order.restaurant} to pick up.` 
    });
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setMyOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    ));
    
    if (newStatus === 'delivered') {
      toast({ title: "Order Delivered!", description: "Great job! Earning added to your account." });
    }
  };

  const cannotFulfillOrder = (order: Order) => {
    setCancelDialog({ open: true, order });
  };

  const confirmCannotFulfill = () => {
    if (!cancelDialog.order || !cancelReason.trim()) return;
    
    const order = cancelDialog.order;
    setMyOrders(prev => prev.filter(o => o.id !== order.id));
    setAvailableOrders(prev => [...prev, { ...order, status: 'available' }]);
    
    toast({ 
      title: "Order Released", 
      description: "Order returned to available orders for other agents." 
    });
    
    setCancelDialog({ open: false, order: null });
    setCancelReason('');
  };

  const pendingOrders = myOrders.filter(o => o.status !== 'delivered');
  const deliveredOrders = myOrders.filter(o => o.status === 'delivered');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold mb-1">Orders</h1>
        <p className="text-muted-foreground">
          {availableOrders.length} available • {pendingOrders.length} in progress
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available" className="gap-2">
            Available
            {availableOrders.length > 0 && (
              <Badge variant="secondary" className="ml-1">{availableOrders.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="my-orders" className="gap-2">
            My Orders
            {pendingOrders.length > 0 && (
              <Badge variant="secondary" className="ml-1">{pendingOrders.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Available Orders */}
        <TabsContent value="available" className="mt-4 space-y-4">
          {availableOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders available right now</p>
                <p className="text-sm text-muted-foreground mt-1">New orders will appear here</p>
              </CardContent>
            </Card>
          ) : (
            availableOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-foreground">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{order.restaurant}</p>
                    </div>
                    <Badge variant="outline" className="bg-accent/10">
                      {order.items.reduce((sum, i) => sum + i.qty, 0)} items
                    </Badge>
                  </div>
                  
                  {/* Items */}
                  <div className="text-sm mb-3 text-muted-foreground">
                    {order.items.map((item, idx) => (
                      <span key={idx}>{item.qty}x {item.name}{idx < order.items.length - 1 ? ', ' : ''}</span>
                    ))}
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{order.location}
                    </span>
                    {order.distance > 0 && <span>{order.distance} km away</span>}
                  </div>

                  {/* Earning & Accept */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-4 w-4 text-veg" />
                      <span className="text-xl font-bold text-veg">₹{order.earning}</span>
                      <span className="text-sm text-muted-foreground ml-1">earning</span>
                    </div>
                    <Button onClick={() => acceptOrder(order)} size="lg">
                      Accept Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* My Orders (Pending) */}
        <TabsContent value="my-orders" className="mt-4 space-y-4">
          {pendingOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders in progress</p>
                <p className="text-sm text-muted-foreground mt-1">Accept an order to get started</p>
              </CardContent>
            </Card>
          ) : (
            pendingOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-foreground">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{order.restaurant}</p>
                    </div>
                    <Badge className={statusOptions.find(s => s.value === order.status)?.color}>
                      {statusOptions.find(s => s.value === order.status)?.label}
                    </Badge>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-muted/50 rounded-lg p-3 mb-4">
                    <p className="font-medium text-foreground">{order.customer}</p>
                    <p className="text-sm text-muted-foreground">{order.customerAddress}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />{order.location}
                    </p>
                  </div>

                  {/* Items */}
                  <div className="text-sm mb-4">
                    <p className="font-medium mb-1">Items:</p>
                    {order.items.map((item, idx) => (
                      <span key={idx} className="text-muted-foreground">
                        {item.qty}x {item.name}{idx < order.items.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>

                  {/* Status Update Buttons */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Update Status:</p>
                    <div className="flex flex-wrap gap-2">
                      {statusOptions.map((status) => (
                        <Button
                          key={status.value}
                          variant={order.status === status.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, status.value as Order['status'])}
                          disabled={order.status === status.value || order.status === 'delivered'}
                        >
                          {status.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Cannot Fulfill */}
                  {order.status !== 'delivered' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4 text-destructive hover:text-destructive hover:bg-destructive/10 w-full"
                      onClick={() => cannotFulfillOrder(order)}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Cannot Fulfill This Order
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}

          {/* Delivered Orders Summary */}
          {deliveredOrders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today's Deliveries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {deliveredOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium">{order.restaurant}</p>
                      <p className="text-sm text-muted-foreground">{order.customer}</p>
                    </div>
                    <span className="font-bold text-veg">+₹{order.earning}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Cannot Fulfill Dialog */}
      <Dialog open={cancelDialog.open} onOpenChange={(open) => !open && setCancelDialog({ open: false, order: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cannot Fulfill Order</DialogTitle>
            <DialogDescription>
              Please provide a reason why you cannot complete this order. The order will be returned to available orders for other agents.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="e.g., Accepted blindly, Location too far, Vehicle issue..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog({ open: false, order: null })}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmCannotFulfill}
              disabled={!cancelReason.trim()}
            >
              Release Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
