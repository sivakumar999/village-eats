import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Order, OrderStatus, CartItem } from '@/types';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  placeOrder: (items: CartItem[], paymentMode: 'COD' | 'ONLINE', customerNotes?: string) => Order;
  getOrderById: (orderId: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignAgent: (orderId: string, agentId: string, agentName: string) => void;
  unassignAgent: (orderId: string) => void;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getPendingOrdersForAgent: (locationId: string) => Order[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

function generateOrderNumber(): string {
  const prefix = 'VE';
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
  return `${prefix}${dateStr}${seq}`;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const { currentLocation } = useLocation();

  const placeOrder = useCallback((
    items: CartItem[],
    paymentMode: 'COD' | 'ONLINE',
    customerNotes?: string
  ): Order => {
    const restaurantId = items[0]?.restaurantId || '';
    const restaurantName = items[0]?.restaurantName || '';
    
    const itemTotal = items.reduce((sum, item) => sum + (item.foodItem.price * item.quantity), 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    
    const isSameVillage = true;
    const deliveryBaseFee = 20;
    const deliveryDistanceFee = 0;
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
      customerId: 'cust-001',
      customerName: 'Customer',
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
      
      // If resetting to placed, also remove agent
      if (status === 'placed') {
        updates.agentId = undefined;
        updates.agentName = undefined;
        updates.acceptedAt = undefined;
      }
      
      switch (status) {
        case 'accepted': updates.acceptedAt = new Date(); break;
        case 'preparing': updates.preparedAt = new Date(); break;
        case 'on_the_way': updates.pickedUpAt = new Date(); break;
        case 'delivered': updates.deliveredAt = new Date(); break;
        case 'cancelled': updates.cancelledAt = new Date(); break;
      }
      
      const updatedOrder = { ...order, ...updates };
      if (currentOrder?.id === orderId) setCurrentOrder(updatedOrder);
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
      if (currentOrder?.id === orderId) setCurrentOrder(updatedOrder);
      return updatedOrder;
    }));
  }, [currentOrder]);

  const unassignAgent = useCallback((orderId: string) => {
    updateOrderStatus(orderId, 'placed');
  }, [updateOrderStatus]);

  const getOrdersByStatus = useCallback((status: OrderStatus) => {
    return orders.filter(o => o.status === status);
  }, [orders]);

  const getPendingOrdersForAgent = useCallback((locationId: string) => {
    return orders.filter(o => o.status === 'placed' && !o.agentId);
  }, [orders]);

  return (
    <OrderContext.Provider value={{
      orders,
      currentOrder,
      placeOrder,
      getOrderById,
      updateOrderStatus,
      assignAgent,
      unassignAgent,
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
