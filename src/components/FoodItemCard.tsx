import { Plus, Minus, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FoodItem } from '@/types';
import { useCart } from '@/context/CartContext';

interface FoodItemCardProps {
  item: FoodItem;
}

export function FoodItemCard({ item }: FoodItemCardProps) {
  const { addItem, removeItem, getItemQuantity, updateQuantity } = useCart();
  const quantity = getItemQuantity(item.id);

  const handleAdd = () => {
    addItem(item);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(item.id, quantity - 1);
    } else {
      removeItem(item.id);
    }
  };

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in">
      <div className="flex gap-4">
        {/* Left Content */}
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-2">
            {/* Veg/Non-veg indicator */}
            <div className={`h-5 w-5 border-2 rounded flex items-center justify-center ${item.isVeg ? 'border-veg' : 'border-non-veg'}`}>
              <div className={`h-2.5 w-2.5 rounded-full ${item.isVeg ? 'bg-veg' : 'bg-non-veg'}`} />
            </div>
            
            {item.isBestseller && (
              <span className="bg-bestseller/20 text-bestseller px-2 py-0.5 rounded text-xs font-semibold">
                ★ Bestseller
              </span>
            )}
            
            {item.isSpicy && (
              <span className="flex items-center gap-0.5 text-spicy">
                <Flame className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
          
          {/* Name & Description */}
          <h3 className="font-display font-semibold text-foreground text-lg">{item.name}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
          
          {/* Price */}
          <p className="font-bold text-lg text-foreground mt-3">₹{item.price}</p>
        </div>

        {/* Right - Image & Add Button */}
        <div className="relative shrink-0">
          <div className="w-28 h-28 rounded-xl overflow-hidden">
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Add/Quantity Button */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
            {quantity === 0 ? (
              <Button 
                onClick={handleAdd}
                className="bg-card text-primary border-2 border-primary hover:bg-primary hover:text-primary-foreground font-bold shadow-md px-6"
                size="sm"
              >
                ADD
              </Button>
            ) : (
              <div className="flex items-center gap-1 bg-primary rounded-lg shadow-md">
                <Button 
                  variant="quantity" 
                  size="sm"
                  onClick={handleDecrement}
                  className="h-8 w-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-6 text-center font-bold text-primary-foreground">{quantity}</span>
                <Button 
                  variant="quantity" 
                  size="sm"
                  onClick={handleAdd}
                  className="h-8 w-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
