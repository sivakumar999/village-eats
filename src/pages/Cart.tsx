import { Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2, MapPin, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import { getRestaurantById } from '@/data/mockData';

export default function Cart() {
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getSubtotal, 
    getDeliveryFee, 
    getTotal,
    currentRestaurantId 
  } = useCart();
  const { currentLocation } = useLocation();

  const restaurant = currentRestaurantId ? getRestaurantById(currentRestaurantId) : null;
  const distance = restaurant?.distance || 0;
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee(distance);
  const total = getTotal(distance);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link to="/" className="p-2 rounded-full hover:bg-muted transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="font-display text-xl font-bold">Your Cart</h1>
            </div>
          </div>
        </header>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Your cart is empty
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            Add some delicious items from our restaurants
          </p>
          <Link to="/">
            <Button variant="hero" size="lg">
              Browse Restaurants
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="p-2 rounded-full hover:bg-muted transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="font-display text-xl font-bold">Your Cart</h1>
                <p className="text-sm text-muted-foreground">
                  From {restaurant?.name}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearCart}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              Clear All
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Cart Items */}
        <section className="space-y-4 mb-8">
          {items.map((item) => (
            <div 
              key={item.foodItem.id}
              className="bg-card rounded-xl p-4 shadow-card animate-fade-in"
            >
              <div className="flex gap-4">
                <img 
                  src={item.foodItem.image}
                  alt={item.foodItem.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`h-4 w-4 border-2 rounded flex items-center justify-center ${item.foodItem.isVeg ? 'border-veg' : 'border-non-veg'}`}>
                          <div className={`h-2 w-2 rounded-full ${item.foodItem.isVeg ? 'bg-veg' : 'bg-non-veg'}`} />
                        </div>
                        <h3 className="font-semibold text-foreground truncate">
                          {item.foodItem.name}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        ₹{item.foodItem.price} each
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.foodItem.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 bg-muted rounded-lg">
                      <Button 
                        variant="quantity" 
                        size="sm"
                        onClick={() => updateQuantity(item.foodItem.id, item.quantity - 1)}
                        className="h-8 w-8"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button 
                        variant="quantity" 
                        size="sm"
                        onClick={() => updateQuantity(item.foodItem.id, item.quantity + 1)}
                        className="h-8 w-8"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <p className="font-bold text-foreground">
                      ₹{item.foodItem.price * item.quantity}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Delivery Info */}
        <section className="bg-card rounded-xl p-4 shadow-card mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Delivery to</p>
              <p className="text-sm text-muted-foreground">{currentLocation?.name}</p>
            </div>
            <Button variant="outline" size="sm">
              Change
            </Button>
          </div>
        </section>

        {/* Bill Details */}
        <section className="bg-card rounded-xl p-4 shadow-card">
          <h3 className="font-display font-bold text-foreground mb-4">Bill Details</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Item Total</span>
              <span className="text-foreground">₹{subtotal}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Base Delivery Fee</span>
              <span className="text-foreground">₹{deliveryFee.baseFee}</span>
            </div>
            
            {deliveryFee.distanceFee > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Distance Fee ({distance} km)</span>
                <span className="text-foreground">₹{deliveryFee.distanceFee}</span>
              </div>
            )}
            
            {deliveryFee.itemDiscount && deliveryFee.itemDiscount > 0 && (
              <div className="flex items-center justify-between text-sm text-accent">
                <span>Multi-item Discount</span>
                <span>-₹{deliveryFee.itemDiscount}</span>
              </div>
            )}
            
            <div className="border-t border-border pt-3 flex items-center justify-between font-bold">
              <span className="text-foreground">To Pay</span>
              <span className="text-foreground text-lg">₹{total}</span>
            </div>
          </div>
        </section>
      </main>

      {/* Checkout Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
        <div className="container mx-auto max-w-lg">
          <Button variant="hero" size="xl" className="w-full">
            Proceed to Pay • ₹{total}
          </Button>
        </div>
      </div>
    </div>
  );
}
