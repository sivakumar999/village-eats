// WebSocket Service for Real-time Order Tracking
import { Order, OrderStatus } from '@/types';

type MessageHandler = (data: any) => void;
type ConnectionHandler = () => void;

interface WebSocketMessage {
  type: string;
  payload: any;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private onConnectHandlers: Set<ConnectionHandler> = new Set();
  private onDisconnectHandlers: Set<ConnectionHandler> = new Set();
  private pendingMessages: WebSocketMessage[] = [];
  private isConnecting = false;

  constructor() {
    this.url = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
  }

  connect(token?: string): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    const wsUrl = token ? `${this.url}?token=${token}` : this.url;
    
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('🔌 WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.onConnectHandlers.forEach(handler => handler());
        
        // Send any pending messages
        this.pendingMessages.forEach(msg => this.send(msg.type, msg.payload));
        this.pendingMessages = [];
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          const handlers = this.messageHandlers.get(message.type);
          if (handlers) {
            handlers.forEach(handler => handler(message.payload));
          }
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.isConnecting = false;
        this.ws = null;
        this.onDisconnectHandlers.forEach(handler => handler());
        this.attemptReconnect(token);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
      this.attemptReconnect(token);
    }
  }

  private attemptReconnect(token?: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      setTimeout(() => this.connect(token), this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
  }

  send(type: string, payload: any): void {
    const message: WebSocketMessage = { type, payload };
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for when connection is established
      this.pendingMessages.push(message);
    }
  }

  on(type: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.messageHandlers.get(type)?.delete(handler);
    };
  }

  onConnect(handler: ConnectionHandler): () => void {
    this.onConnectHandlers.add(handler);
    return () => this.onConnectHandlers.delete(handler);
  }

  onDisconnect(handler: ConnectionHandler): () => void {
    this.onDisconnectHandlers.add(handler);
    return () => this.onDisconnectHandlers.delete(handler);
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const wsService = new WebSocketService();

// ============= Order Tracking Specific Methods =============

export interface OrderStatusUpdate {
  orderId: string;
  status: OrderStatus;
  updatedAt: string;
  agentId?: string;
  agentName?: string;
  agentLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface AgentLocationUpdate {
  orderId: string;
  agentId: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
}

export const orderTracking = {
  // Subscribe to order updates for a specific order
  subscribeToOrder: (orderId: string, callback: (update: OrderStatusUpdate) => void): (() => void) => {
    wsService.send('subscribe_order', { orderId });
    
    const unsubscribe = wsService.on('order_update', (data: OrderStatusUpdate) => {
      if (data.orderId === orderId) {
        callback(data);
      }
    });

    return () => {
      wsService.send('unsubscribe_order', { orderId });
      unsubscribe();
    };
  },

  // Subscribe to agent location updates for an order
  subscribeToAgentLocation: (orderId: string, callback: (update: AgentLocationUpdate) => void): (() => void) => {
    return wsService.on('agent_location', (data: AgentLocationUpdate) => {
      if (data.orderId === orderId) {
        callback(data);
      }
    });
  },

  // For agents: Subscribe to new orders in their area
  subscribeToNewOrders: (locationId: string, callback: (order: Order) => void): (() => void) => {
    wsService.send('subscribe_new_orders', { locationId });
    
    const unsubscribe = wsService.on('new_order', callback);

    return () => {
      wsService.send('unsubscribe_new_orders', { locationId });
      unsubscribe();
    };
  },

  // For agents: Update their location
  updateAgentLocation: (latitude: number, longitude: number): void => {
    wsService.send('agent_location_update', { latitude, longitude });
  },

  // For agents: Notify order status change
  notifyStatusChange: (orderId: string, status: OrderStatus): void => {
    wsService.send('order_status_change', { orderId, status });
  },
};

export default wsService;
