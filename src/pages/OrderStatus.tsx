import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrderTracking } from '@/components/OrderTracking';
import { useOrders } from '@/context/OrderContext';

export default function OrderStatus() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { getOrderById, currentOrder, updateOrderStatus } = useOrders();

  const order = orderId ? getOrderById(orderId) : currentOrder;

  // Simulate status progression for demo
  useEffect(() => {
    if (!order || order.status === 'delivered' || order.status === 'cancelled') return;

    const statusProgression: { [key: string]: { next: string; delay: number } } = {
      placed: { next: 'accepted', delay: 5000 },
      accepted: { next: 'preparing', delay: 8000 },
      preparing: { next: 'on_the_way', delay: 12000 },
      on_the_way: { next: 'delivered', delay: 15000 },
    };

    const current = statusProgression[order.status];
    if (!current) return;

    const timeout = setTimeout(() => {
      updateOrderStatus(order.id, current.next as any);
    }, current.delay);

    return () => clearTimeout(timeout);
  }, [order, updateOrderStatus]);

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Order not found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find the order you're looking for.
          </p>
          <Link to="/">
            <Button variant="hero">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-xl font-bold">Order Status</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg">
        {/* Order Success Banner (for just placed orders) */}
        {order.status === 'placed' && (
          <div className="bg-gradient-to-r from-accent to-primary/80 rounded-xl p-6 mb-6 text-center animate-fade-in">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold text-white mb-2">
              Order Placed!
            </h2>
            <p className="text-white/80">
              Your order has been sent to {order.restaurantName}
            </p>
          </div>
        )}

        {/* Order Tracking */}
        <OrderTracking order={order} />

        {/* Order Details */}
        <div className="bg-card rounded-xl shadow-card p-4 mt-6">
          <h3 className="font-display font-bold text-foreground mb-4">Order Details</h3>
          
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.quantity}x {item.foodItemName}
                </span>
                <span className="text-foreground">₹{item.totalPrice}</span>
              </div>
            ))}
            
            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Item Total</span>
                <span>₹{order.itemTotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>₹{order.deliveryBaseFee + order.deliveryDistanceFee - order.multiItemDiscount}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-border">
                <span>Total</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-card rounded-xl shadow-card p-4 mt-4">
          <h3 className="font-display font-bold text-foreground mb-2">Delivery Address</h3>
          <p className="text-muted-foreground text-sm">{order.deliveryAddress}</p>
          {order.customerNotes && (
            <p className="text-sm text-muted-foreground mt-2 italic">
              Note: {order.customerNotes}
            </p>
          )}
        </div>

        {/* Payment Info */}
        <div className="bg-card rounded-xl shadow-card p-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-foreground">Payment</h3>
              <p className="text-sm text-muted-foreground">{order.paymentMode === 'COD' ? 'Cash on Delivery' : 'Paid Online'}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              order.paymentStatus === 'completed' 
                ? 'bg-accent/20 text-accent-foreground' 
                : 'bg-warning/20 text-warning-foreground'
            }`}>
              {order.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          {order.status === 'delivered' && (
            <Link to="/" className="block">
              <Button variant="hero" size="lg" className="w-full gap-2">
                <RotateCcw className="h-4 w-4" />
                Order Again
              </Button>
            </Link>
          )}
          
          <Link to="/" className="block">
            <Button variant="outline" size="lg" className="w-full gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
