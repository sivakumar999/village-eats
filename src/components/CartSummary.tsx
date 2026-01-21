import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Link } from 'react-router-dom';

interface CartSummaryProps {
  distance?: number;
}

export function CartSummary({ distance = 0 }: CartSummaryProps) {
  const { items, getTotalItems, getSubtotal, getDeliveryFee, getTotal } = useCart();
  
  if (items.length === 0) return null;
  
  const totalItems = getTotalItems();
  const subtotal = getSubtotal();
  const restaurantName = items[0]?.restaurantName;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-background via-background to-transparent pointer-events-none">
      <div className="container mx-auto max-w-lg pointer-events-auto">
        <Link to="/cart">
          <div className="bg-primary rounded-2xl p-4 shadow-primary flex items-center justify-between gap-4 hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-3">
              <div className="bg-primary-foreground/20 rounded-xl p-2">
                <ShoppingBag className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-primary-foreground font-bold">
                  {totalItems} item{totalItems > 1 ? 's' : ''} • ₹{subtotal}
                </p>
                <p className="text-primary-foreground/80 text-sm truncate max-w-[150px]">
                  From {restaurantName}
                </p>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold"
            >
              View Cart
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </Link>
      </div>
    </div>
  );
}
