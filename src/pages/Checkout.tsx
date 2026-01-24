import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, Banknote, FileText, Loader2, User, Phone, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import { useOrders } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import { getRestaurantById } from '@/data/mockData';
import { cn } from '@/lib/utils';

type PaymentMode = 'COD' | 'ONLINE';

interface DeliveryDetails {
  name: string;
  phone: string;
  locationId: string;
  address: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getSubtotal, getDeliveryFee, getTotal, currentRestaurantId, clearCart } = useCart();
  const { currentLocation, availableLocations, setCurrentLocation } = useLocation();
  const { placeOrder } = useOrders();
  const { user } = useAuth();
  
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('COD');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Delivery details form - pre-fill from user if available
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>({
    name: '',
    phone: '',
    locationId: '',
    address: '',
  });
  const [errors, setErrors] = useState<Partial<DeliveryDetails>>({});

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      setDeliveryDetails(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
        locationId: prev.locationId || user.locationId || currentLocation?.id || '',
        address: prev.address || user.address || '',
      }));
    } else if (currentLocation) {
      setDeliveryDetails(prev => ({
        ...prev,
        locationId: prev.locationId || currentLocation.id,
      }));
    }
  }, [user, currentLocation]);

  const restaurant = currentRestaurantId ? getRestaurantById(currentRestaurantId) : null;
  const distance = restaurant?.distance || 0;
  const selectedLocation = availableLocations.find(l => l.id === deliveryDetails.locationId);
  const isSameVillage = selectedLocation?.id === restaurant?.locationId;
  
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee(distance, isSameVillage);
  const total = getTotal(distance, isSameVillage);

  const handleDeliveryChange = (field: keyof DeliveryDetails, value: string) => {
    setDeliveryDetails(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    
    // Update location context if location changed
    if (field === 'locationId') {
      const newLocation = availableLocations.find(l => l.id === value);
      if (newLocation) {
        setCurrentLocation(newLocation);
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<DeliveryDetails> = {};
    
    if (!deliveryDetails.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!deliveryDetails.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(deliveryDetails.phone.trim())) {
      newErrors.phone = 'Enter a valid 10-digit mobile number';
    }
    
    if (!deliveryDetails.locationId) {
      newErrors.locationId = 'Please select delivery location';
    }
    
    if (!deliveryDetails.address.trim()) {
      newErrors.address = 'Delivery address is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Include delivery details in order
    const orderNotes = customerNotes 
      ? `Deliver to: ${deliveryDetails.name} (${deliveryDetails.phone})\nAddress: ${deliveryDetails.address}\n\nNotes: ${customerNotes}`
      : `Deliver to: ${deliveryDetails.name} (${deliveryDetails.phone})\nAddress: ${deliveryDetails.address}`;
    
    const order = placeOrder(items, paymentMode, orderNotes);
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
        {/* Delivery Details Form */}
        <section className="bg-card rounded-xl p-4 shadow-card mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Delivery Details</h3>
              <p className="text-xs text-muted-foreground">Who will receive this order?</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Receiver Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">
                <User className="inline h-3 w-3 mr-1" />
                Receiver Name *
              </Label>
              <Input
                id="name"
                placeholder="Enter receiver's name"
                value={deliveryDetails.name}
                onChange={(e) => handleDeliveryChange('name', e.target.value)}
                className={cn(errors.name && "border-destructive")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm">
                <Phone className="inline h-3 w-3 mr-1" />
                Mobile Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="10-digit mobile number"
                value={deliveryDetails.phone}
                onChange={(e) => handleDeliveryChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                className={cn(errors.phone && "border-destructive")}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone}</p>
              )}
            </div>

            {/* Delivery Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm">
                <MapPin className="inline h-3 w-3 mr-1" />
                Delivery Village *
              </Label>
              <Select
                value={deliveryDetails.locationId}
                onValueChange={(value) => handleDeliveryChange('locationId', value)}
              >
                <SelectTrigger className={cn(errors.locationId && "border-destructive")}>
                  <SelectValue placeholder="Select delivery village" />
                </SelectTrigger>
                <SelectContent>
                  {availableLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.locationId && (
                <p className="text-xs text-destructive">{errors.locationId}</p>
              )}
              {isSameVillage && (
                <span className="inline-block px-2 py-0.5 bg-accent/20 text-accent-foreground text-xs rounded-full">
                  Same Village - No Distance Fee!
                </span>
              )}
            </div>

            {/* Detailed Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm">
                <Home className="inline h-3 w-3 mr-1" />
                Detailed Address *
              </Label>
              <Textarea
                id="address"
                placeholder="House/Flat No., Street, Landmark, etc."
                value={deliveryDetails.address}
                onChange={(e) => handleDeliveryChange('address', e.target.value)}
                className={cn("resize-none", errors.address && "border-destructive")}
                rows={2}
              />
              {errors.address && (
                <p className="text-xs text-destructive">{errors.address}</p>
              )}
            </div>
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
