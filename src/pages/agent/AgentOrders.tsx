import { useState } from 'react';
import { MapPin, IndianRupee, Package, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useOrders } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import { Order, OrderStatus } from '@/types';

const statusOptions = [
  { value: 'accepted', label: 'Accepted', color: 'bg-primary/20 text-primary' },
  { value: 'preparing', label: 'Preparing in Restaurant', color: 'bg-warning/20 text-warning-foreground' },
  { value: 'on_the_way', label: 'In Delivery Route', color: 'bg-accent/20 text-accent-foreground' },
  { value: 'delivered', label: 'Delivered', color: 'bg-veg/20 text-veg' },
];

export default function AgentOrders() {
  const { orders, assignAgent, updateOrderStatus } = useOrders();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('available');
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; orderId: string | null }>({ open: false, orderId: null });
  const [cancelReason, setCancelReason] = useState('');
  const { toast } = useToast();

  // Available orders = placed, no agent assigned
  const availableOrders = orders.filter(o => o.status === 'placed' && !o.agentId);
  
  // My orders = assigned to this agent, not delivered
  const myActiveOrders = orders.filter(o => o.agentId === user?.id && !['delivered', 'cancelled'].includes(o.status));
  const myDeliveredOrders = orders.filter(o => o.agentId === user?.id && o.status === 'delivered');

  const acceptOrder = (order: Order) => {
    assignAgent(order.id, user?.id || 'agent-001', user?.name || 'Agent');
    setActiveTab('my-orders');
    toast({ 
      title: "Order Accepted!", 
      description: `Order ${order.orderNumber} - Navigate to ${order.restaurantName} to pick up.` 
    });
  };

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    if (newStatus === 'delivered') {
      toast({ title: "Order Delivered!", description: "Great job! Earning added to your account." });
    }
  };

  const cannotFulfillOrder = (orderId: string) => {
    setCancelDialog({ open: true, orderId });
  };

  const confirmCannotFulfill = () => {
    if (!cancelDialog.orderId || !cancelReason.trim()) return;
    // Reset order to placed status and remove agent
    updateOrderStatus(cancelDialog.orderId, 'placed');
    // Note: In a real app, this would also unassign the agent via API
    toast({ 
      title: "Order Released", 
      description: "Order returned to available orders for other agents." 
    });
    setCancelDialog({ open: false, orderId: null });
    setCancelReason('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold mb-1">Orders</h1>
        <p className="text-muted-foreground">
          {availableOrders.length} available • {myActiveOrders.length} in progress
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available" className="gap-2">
            Available
            {availableOrders.length > 0 && <Badge variant="secondary" className="ml-1">{availableOrders.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="my-orders" className="gap-2">
            My Orders
            {myActiveOrders.length > 0 && <Badge variant="secondary" className="ml-1">{myActiveOrders.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-4 space-y-4">
          {availableOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders available right now</p>
                <p className="text-sm text-muted-foreground mt-1">New orders will appear here when customers place them</p>
              </CardContent>
            </Card>
          ) : (
            availableOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-foreground">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{order.restaurantName}</p>
                    </div>
                    <Badge variant="outline" className="bg-accent/10">
                      {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
                    </Badge>
                  </div>
                  
                  <div className="text-sm mb-3 text-muted-foreground">
                    {order.items.map((item, idx) => (
                      <span key={idx}>{item.quantity}x {item.foodItemName}{idx < order.items.length - 1 ? ', ' : ''}</span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{order.deliveryAddress}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-4 w-4 text-veg" />
                      <span className="text-xl font-bold text-veg">₹{order.deliveryBaseFee}</span>
                      <span className="text-sm text-muted-foreground ml-1">earning</span>
                    </div>
                    <Button onClick={() => acceptOrder(order)} size="lg">Accept Order</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="my-orders" className="mt-4 space-y-4">
          {myActiveOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders in progress</p>
                <p className="text-sm text-muted-foreground mt-1">Accept an order to get started</p>
              </CardContent>
            </Card>
          ) : (
            myActiveOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-foreground">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{order.restaurantName}</p>
                    </div>
                    <Badge className={statusOptions.find(s => s.value === order.status)?.color}>
                      {statusOptions.find(s => s.value === order.status)?.label || order.status}
                    </Badge>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3 mb-4">
                    <p className="font-medium text-foreground">{order.customerName}</p>
                    <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                  </div>

                  <div className="text-sm mb-4">
                    <p className="font-medium mb-1">Items:</p>
                    {order.items.map((item, idx) => (
                      <span key={idx} className="text-muted-foreground">
                        {item.quantity}x {item.foodItemName}{idx < order.items.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Update Status:</p>
                    <div className="flex flex-wrap gap-2">
                      {statusOptions.map((status) => (
                        <Button
                          key={status.value}
                          variant={order.status === status.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleUpdateStatus(order.id, status.value as OrderStatus)}
                          disabled={order.status === status.value || order.status === 'delivered'}
                        >
                          {status.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {order.status !== 'delivered' && (
                    <Button
                      variant="ghost" size="sm"
                      className="mt-4 text-destructive hover:text-destructive hover:bg-destructive/10 w-full"
                      onClick={() => cannotFulfillOrder(order.id)}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Cannot Fulfill This Order
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}

          {myDeliveredOrders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today's Deliveries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {myDeliveredOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium">{order.restaurantName}</p>
                      <p className="text-sm text-muted-foreground">{order.customerName}</p>
                    </div>
                    <span className="font-bold text-veg">+₹{order.deliveryBaseFee}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={cancelDialog.open} onOpenChange={(open) => !open && setCancelDialog({ open: false, orderId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cannot Fulfill Order</DialogTitle>
            <DialogDescription>
              Please provide a reason. The order will be returned to available orders for other agents.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="e.g., Accepted blindly, Location too far, Vehicle issue..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog({ open: false, orderId: null })}>Cancel</Button>
            <Button variant="destructive" onClick={confirmCannotFulfill} disabled={!cancelReason.trim()}>
              Release Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
