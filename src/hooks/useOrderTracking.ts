import { useState, useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '@/types';
import { ordersApi } from '@/lib/api';
import { orderTracking, OrderStatusUpdate, AgentLocationUpdate, wsService } from '@/lib/websocket';

interface AgentLocation {
  latitude: number;
  longitude: number;
  updatedAt: Date;
}

interface UseOrderTrackingReturn {
  order: Order | null;
  isLoading: boolean;
  error: string | null;
  agentLocation: AgentLocation | null;
  isConnected: boolean;
  refetch: () => Promise<void>;
}

export function useOrderTracking(orderId: string): UseOrderTrackingReturn {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agentLocation, setAgentLocation] = useState<AgentLocation | null>(null);
  const [isConnected, setIsConnected] = useState(wsService.isConnected());

  // Fetch order details
  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await ordersApi.getById(orderId);
      if (response.success && response.data) {
        setOrder(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  // Initial fetch
  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // WebSocket connection status
  useEffect(() => {
    const unsubConnect = wsService.onConnect(() => setIsConnected(true));
    const unsubDisconnect = wsService.onDisconnect(() => setIsConnected(false));

    return () => {
      unsubConnect();
      unsubDisconnect();
    };
  }, []);

  // Subscribe to real-time order updates
  useEffect(() => {
    if (!orderId) return;

    const unsubscribeOrder = orderTracking.subscribeToOrder(orderId, (update: OrderStatusUpdate) => {
      setOrder(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          status: update.status,
          agentId: update.agentId || prev.agentId,
          agentName: update.agentName || prev.agentName,
          // Update timestamps based on status
          ...(update.status === 'accepted' && { acceptedAt: new Date(update.updatedAt) }),
          ...(update.status === 'preparing' && { preparedAt: new Date(update.updatedAt) }),
          ...(update.status === 'on_the_way' && { pickedUpAt: new Date(update.updatedAt) }),
          ...(update.status === 'delivered' && { deliveredAt: new Date(update.updatedAt) }),
          ...(update.status === 'cancelled' && { cancelledAt: new Date(update.updatedAt) }),
        };
      });

      // Update agent location if provided
      if (update.agentLocation) {
        setAgentLocation({
          latitude: update.agentLocation.latitude,
          longitude: update.agentLocation.longitude,
          updatedAt: new Date(update.updatedAt),
        });
      }
    });

    const unsubscribeLocation = orderTracking.subscribeToAgentLocation(orderId, (update: AgentLocationUpdate) => {
      setAgentLocation({
        latitude: update.latitude,
        longitude: update.longitude,
        updatedAt: new Date(update.updatedAt),
      });
    });

    return () => {
      unsubscribeOrder();
      unsubscribeLocation();
    };
  }, [orderId]);

  return {
    order,
    isLoading,
    error,
    agentLocation,
    isConnected,
    refetch: fetchOrder,
  };
}

// Hook for agents to track and update their orders
export function useAgentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyOrders = useCallback(async () => {
    try {
      const response = await (await import('@/lib/api')).agentsApi.getMyOrders();
      if (response.success && response.data) {
        setOrders(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    }
  }, []);

  const fetchAvailableOrders = useCallback(async () => {
    try {
      const response = await (await import('@/lib/api')).agentsApi.getAvailableOrders();
      if (response.success && response.data) {
        setAvailableOrders(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch available orders');
    }
  }, []);

  const acceptOrder = useCallback(async (orderId: string) => {
    try {
      const response = await (await import('@/lib/api')).agentsApi.acceptOrder(orderId);
      if (response.success) {
        await fetchMyOrders();
        await fetchAvailableOrders();
      }
      return response;
    } catch (err) {
      throw err;
    }
  }, [fetchMyOrders, fetchAvailableOrders]);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    try {
      const response = await (await import('@/lib/api')).agentsApi.updateOrderStatus(orderId, status);
      if (response.success) {
        // Notify via WebSocket
        orderTracking.notifyStatusChange(orderId, status);
        await fetchMyOrders();
      }
      return response;
    } catch (err) {
      throw err;
    }
  }, [fetchMyOrders]);

  // Initial fetch
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchMyOrders(), fetchAvailableOrders()]);
      setIsLoading(false);
    };
    init();
  }, [fetchMyOrders, fetchAvailableOrders]);

  // Subscribe to new orders in agent's area
  useEffect(() => {
    const unsubscribe = wsService.on('new_order', (order: Order) => {
      setAvailableOrders(prev => [order, ...prev]);
    });

    return unsubscribe;
  }, []);

  // Update agent location periodically when they have active orders
  useEffect(() => {
    const activeOrders = orders.filter(o => ['accepted', 'preparing', 'on_the_way'].includes(o.status));
    
    if (activeOrders.length === 0) return;

    const updateLocation = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            orderTracking.updateAgentLocation(position.coords.latitude, position.coords.longitude);
          },
          (error) => console.error('Geolocation error:', error),
          { enableHighAccuracy: true }
        );
      }
    };

    updateLocation();
    const interval = setInterval(updateLocation, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [orders]);

  return {
    orders,
    availableOrders,
    isLoading,
    error,
    acceptOrder,
    updateOrderStatus,
    refetchOrders: fetchMyOrders,
    refetchAvailable: fetchAvailableOrders,
  };
}
