import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CartItem, FoodItem, DeliveryFee } from '@/types';
import { getRestaurantById } from '@/data/mockData';

interface CartContextType {
  items: CartItem[];
  addItem: (item: FoodItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (itemId: string) => number;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getDeliveryFee: (distance: number, isSameVillage?: boolean) => DeliveryFee;
  getTotal: (distance: number, isSameVillage?: boolean) => number;
  currentRestaurantId: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const BASE_DELIVERY_FEE = 20;
const PER_KM_RATE = 9;
const MULTI_ITEM_DISCOUNT = 10;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [currentRestaurantId, setCurrentRestaurantId] = useState<string | null>(null);

  const playSound = useCallback((type: 'add' | 'remove') => {
    // Sound feedback placeholder - can be implemented with HTML5 Audio
    console.log(`Sound: ${type}`);
  }, []);

  const addItem = useCallback((foodItem: FoodItem) => {
    const restaurant = getRestaurantById(foodItem.restaurantId);
    if (!restaurant) return;

    setItems(prev => {
      // Check if adding from a different restaurant
      if (currentRestaurantId && currentRestaurantId !== foodItem.restaurantId && prev.length > 0) {
        // For now, clear cart when switching restaurants
        setCurrentRestaurantId(foodItem.restaurantId);
        return [{
          foodItem,
          quantity: 1,
          restaurantId: foodItem.restaurantId,
          restaurantName: restaurant.name,
        }];
      }

      if (!currentRestaurantId) {
        setCurrentRestaurantId(foodItem.restaurantId);
      }

      const existingIndex = prev.findIndex(i => i.foodItem.id === foodItem.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }

      return [...prev, {
        foodItem,
        quantity: 1,
        restaurantId: foodItem.restaurantId,
        restaurantName: restaurant.name,
      }];
    });

    playSound('add');
  }, [currentRestaurantId, playSound]);

  const removeItem = useCallback((itemId: string) => {
    setItems(prev => {
      const updated = prev.filter(i => i.foodItem.id !== itemId);
      if (updated.length === 0) {
        setCurrentRestaurantId(null);
      }
      return updated;
    });
    playSound('remove');
  }, [playSound]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(prev => {
      return prev.map(item => 
        item.foodItem.id === itemId 
          ? { ...item, quantity }
          : item
      );
    });
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    setCurrentRestaurantId(null);
  }, []);

  const getItemQuantity = useCallback((itemId: string) => {
    const item = items.find(i => i.foodItem.id === itemId);
    return item?.quantity || 0;
  }, [items]);

  const getTotalItems = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const getSubtotal = useCallback(() => {
    return items.reduce((sum, item) => sum + (item.foodItem.price * item.quantity), 0);
  }, [items]);

  const getDeliveryFee = useCallback((distance: number, isSameVillage: boolean = true): DeliveryFee => {
    const totalItems = getTotalItems();
    let baseFee = BASE_DELIVERY_FEE;
    
    // Distance-based fee ONLY for different village deliveries
    // Same village = no per-km charges
    const distanceFee = !isSameVillage && distance > 0 ? Math.round(distance * PER_KM_RATE) : 0;
    
    // Multi-item discount (applies when 2+ items from same restaurant)
    let itemDiscount = 0;
    if (totalItems >= 2) {
      itemDiscount = MULTI_ITEM_DISCOUNT;
    }

    return {
      baseFee,
      distanceFee,
      itemDiscount,
      total: baseFee + distanceFee - itemDiscount,
    };
  }, [getTotalItems]);

  const getTotal = useCallback((distance: number, isSameVillage: boolean = true) => {
    const subtotal = getSubtotal();
    const deliveryFee = getDeliveryFee(distance, isSameVillage);
    return subtotal + deliveryFee.total;
  }, [getSubtotal, getDeliveryFee]);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getItemQuantity,
      getTotalItems,
      getSubtotal,
      getDeliveryFee,
      getTotal,
      currentRestaurantId,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
