import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, Banknote, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import { useOrders } from '@/context/OrderContext';
import { getRestaurantById } from '@/data/mockData';
import { cn } from '@/lib/utils';

type PaymentMode = 'COD' | 'ONLINE';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getSubtotal, getDeliveryFee, getTotal, currentRestaurantId, clearCart } = useCart();
  const { currentLocation } = useLocation();
  const { placeOrder } = useOrders();
  
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('COD');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const restaurant = currentRestaurantId ? getRestaurantById(currentRestaurantId) : null;
  const distance = restaurant?.distance || 0;
  const isSameVillage = currentLocation?.id === restaurant?.locationId;
  
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee(distance, isSameVillage);
  const total = getTotal(distance, isSameVillage);

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const order = placeOrder(items, paymentMode, customerNotes || undefined);
    clearCart();
    
    navigate(`/order/${order.id}`);
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/cart" className="p-2 rounded-full hover:bg-muted transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-display text-xl font-bold">Checkout</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg">
        {/* Delivery Address */}
        <section className="bg-card rounded-xl p-4 shadow-card mb-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Deliver to</h3>
              <p className="text-sm text-muted-foreground mt-1">{currentLocation?.name}</p>
              {isSameVillage && (
                <span className="inline-block mt-2 px-2 py-0.5 bg-accent/20 text-accent-foreground text-xs rounded-full">
                  Same Village - No Distance Fee!
                </span>
              )}
            </div>
            <Button variant="outline" size="sm">
              Change
            </Button>
          </div>
        </section>

        {/* Order Summary */}
        <section className="bg-card rounded-xl p-4 shadow-card mb-4">
          <h3 className="font-display font-bold text-foreground mb-3">Order Summary</h3>
          <p className="text-sm text-muted-foreground mb-3">
            {items.length} item{items.length > 1 ? 's' : ''} from {restaurant?.name}
          </p>
          
          <div className="space-y-2 text-sm">
            {items.map(item => (
              <div key={item.foodItem.id} className="flex justify-between">
                <span className="text-muted-foreground">
                  {item.quantity}x {item.foodItem.name}
                </span>
                <span>₹{item.foodItem.price * item.quantity}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Special Instructions */}
        <section className="bg-card rounded-xl p-4 shadow-card mb-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Special Instructions</h3>
          </div>
          <Textarea
            placeholder="Any special requests for your order? (e.g., less spicy, no onions)"
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            className="resize-none"
            rows={3}
          />
        </section>

        {/* Payment Method */}
        <section className="bg-card rounded-xl p-4 shadow-card mb-4">
          <h3 className="font-display font-bold text-foreground mb-4">Payment Method</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => setPaymentMode('COD')}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all",
                paymentMode === 'COD' 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center",
                paymentMode === 'COD' ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                <Banknote className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-foreground">Cash on Delivery</p>
                <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
              </div>
              <div className={cn(
                "h-5 w-5 rounded-full border-2",
                paymentMode === 'COD' 
                  ? "border-primary bg-primary" 
                  : "border-muted-foreground"
              )}>
                {paymentMode === 'COD' && (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={() => setPaymentMode('ONLINE')}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all",
                paymentMode === 'ONLINE' 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center",
                paymentMode === 'ONLINE' ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-foreground">Online Payment</p>
                <p className="text-sm text-muted-foreground">Pay securely online (Simulated)</p>
              </div>
              <div className={cn(
                "h-5 w-5 rounded-full border-2",
                paymentMode === 'ONLINE' 
                  ? "border-primary bg-primary" 
                  : "border-muted-foreground"
              )}>
                {paymentMode === 'ONLINE' && (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </button>
          </div>
        </section>

        {/* Bill Details */}
        <section className="bg-card rounded-xl p-4 shadow-card">
          <h3 className="font-display font-bold text-foreground mb-4">Bill Details</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Item Total</span>
              <span>₹{subtotal}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>₹{deliveryFee.baseFee}</span>
            </div>
            
            {deliveryFee.distanceFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Distance Fee</span>
                <span>₹{deliveryFee.distanceFee}</span>
              </div>
            )}
            
            {deliveryFee.itemDiscount && deliveryFee.itemDiscount > 0 && (
              <div className="flex justify-between text-sm text-accent">
                <span>Multi-item Discount</span>
                <span>-₹{deliveryFee.itemDiscount}</span>
              </div>
            )}
            
            <div className="border-t border-border pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-lg">₹{total}</span>
            </div>
          </div>
        </section>
      </main>

      {/* Place Order Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
        <div className="container mx-auto max-w-lg">
          <Button 
            variant="hero" 
            size="xl" 
            className="w-full"
            onClick={handlePlaceOrder}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>Place Order • ₹{total}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
