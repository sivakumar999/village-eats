import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Order, OrderStatus, CartItem } from '@/types';
import { useLocation } from '@/context/LocationContext';

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  placeOrder: (items: CartItem[], paymentMode: 'COD' | 'ONLINE', customerNotes?: string) => Order;
  getOrderById: (orderId: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignAgent: (orderId: string, agentId: string, agentName: string) => void;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getPendingOrdersForAgent: (locationId: string) => Order[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Generate unique order number
function generateOrderNumber(): string {
  const prefix = 'VE';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const { currentLocation } = useLocation();

  // Simulate real-time updates (polling simulation)
  useEffect(() => {
    if (!currentOrder) return;

    const interval = setInterval(() => {
      setOrders(prev => {
        const updated = prev.find(o => o.id === currentOrder.id);
        if (updated && updated.status !== currentOrder.status) {
          setCurrentOrder(updated);
        }
        return prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [currentOrder]);

  const placeOrder = useCallback((
    items: CartItem[],
    paymentMode: 'COD' | 'ONLINE',
    customerNotes?: string
  ): Order => {
    const restaurantId = items[0]?.restaurantId || '';
    const restaurantName = items[0]?.restaurantName || '';
    
    // Calculate totals
    const itemTotal = items.reduce((sum, item) => sum + (item.foodItem.price * item.quantity), 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Delivery fee calculation (same village = no distance fee)
    const isSameVillage = true; // Simplified - in real app check against restaurant location
    const deliveryBaseFee = 20;
    const deliveryDistanceFee = isSameVillage ? 0 : 0;
    const multiItemDiscount = totalItems >= 2 ? 10 : 0;
    
    const newOrder: Order = {
      id: generateId(),
      orderNumber: generateOrderNumber(),
      items: items.map(item => ({
        id: generateId(),
        foodItemId: item.foodItem.id,
        foodItemName: item.foodItem.name,
        quantity: item.quantity,
        unitPrice: item.foodItem.price,
        totalPrice: item.foodItem.price * item.quantity,
      })),
      status: 'placed',
      customerId: 'guest-user', // In real app, get from auth
      customerName: 'Guest Customer',
      restaurantId,
      restaurantName,
      deliveryLocationId: currentLocation?.id || '',
      deliveryAddress: currentLocation?.name || '',
      isSameVillage,
      itemTotal,
      deliveryBaseFee,
      deliveryDistanceFee,
      multiItemDiscount,
      totalAmount: itemTotal + deliveryBaseFee + deliveryDistanceFee - multiItemDiscount,
      paymentMode,
      paymentStatus: paymentMode === 'COD' ? 'pending' : 'completed',
      placedAt: new Date(),
      customerNotes,
    };

    setOrders(prev => [newOrder, ...prev]);
    setCurrentOrder(newOrder);
    
    return newOrder;
  }, [currentLocation]);

  const getOrderById = useCallback((orderId: string) => {
    return orders.find(o => o.id === orderId);
  }, [orders]);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      
      const updates: Partial<Order> = { status };
      
      switch (status) {
        case 'accepted':
          updates.acceptedAt = new Date();
          break;
        case 'preparing':
          updates.preparedAt = new Date();
          break;
        case 'on_the_way':
          updates.pickedUpAt = new Date();
          break;
        case 'delivered':
          updates.deliveredAt = new Date();
          break;
        case 'cancelled':
          updates.cancelledAt = new Date();
          break;
      }
      
      const updatedOrder = { ...order, ...updates };
      
      if (currentOrder?.id === orderId) {
        setCurrentOrder(updatedOrder);
      }
      
      return updatedOrder;
    }));
  }, [currentOrder]);

  const assignAgent = useCallback((orderId: string, agentId: string, agentName: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      
      const updatedOrder = {
        ...order,
        agentId,
        agentName,
        status: 'accepted' as OrderStatus,
        acceptedAt: new Date(),
      };
      
      if (currentOrder?.id === orderId) {
        setCurrentOrder(updatedOrder);
      }
      
      return updatedOrder;
    }));
  }, [currentOrder]);

  const getOrdersByStatus = useCallback((status: OrderStatus) => {
    return orders.filter(o => o.status === status);
  }, [orders]);

  const getPendingOrdersForAgent = useCallback((locationId: string) => {
    return orders.filter(o => 
      o.status === 'placed' && 
      !o.agentId &&
      o.deliveryLocationId === locationId
    );
  }, [orders]);

  return (
    <OrderContext.Provider value={{
      orders,
      currentOrder,
      placeOrder,
      getOrderById,
      updateOrderStatus,
      assignAgent,
      getOrdersByStatus,
      getPendingOrdersForAgent,
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
