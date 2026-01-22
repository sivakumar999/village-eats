import { useEffect, useState } from 'react';
import { Check, Clock, ChefHat, Bike, MapPin, Phone, Package } from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OrderTrackingProps {
  order: Order;
  onStatusUpdate?: (status: OrderStatus) => void;
}

const ORDER_STEPS: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: 'placed', label: 'Order Placed', icon: Package },
  { status: 'accepted', label: 'Order Accepted', icon: Check },
  { status: 'preparing', label: 'Preparing', icon: ChefHat },
  { status: 'on_the_way', label: 'On the Way', icon: Bike },
  { status: 'delivered', label: 'Delivered', icon: MapPin },
];

function getStepIndex(status: OrderStatus): number {
  if (status === 'cancelled') return -1;
  return ORDER_STEPS.findIndex(s => s.status === status);
}

export function OrderTracking({ order, onStatusUpdate }: OrderTrackingProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const currentStepIndex = getStepIndex(order.status);

  // Update elapsed time
  useEffect(() => {
    const startTime = order.placedAt.getTime();
    
    const updateTime = () => {
      const now = Date.now();
      setElapsedTime(Math.floor((now - startTime) / 1000 / 60)); // minutes
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [order.placedAt]);

  if (order.status === 'cancelled') {
    return (
      <div className="bg-destructive/10 rounded-xl p-6 text-center">
        <div className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
          <Package className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="font-display text-xl font-bold text-destructive mb-2">
          Order Cancelled
        </h3>
        <p className="text-muted-foreground text-sm">
          Cancelled at {order.cancelledAt?.toLocaleTimeString()}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="bg-primary/5 p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Order #{order.orderNumber}</p>
            <h3 className="font-display font-bold text-foreground">
              {order.status === 'delivered' ? 'Delivered!' : 'Track Your Order'}
            </h3>
          </div>
          <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-full">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {order.status === 'delivered' ? 'Completed' : `${elapsedTime} min`}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="p-6">
        <div className="relative">
          {ORDER_STEPS.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const Icon = step.icon;

            return (
              <div key={step.status} className="flex items-start gap-4 relative">
                {/* Connector Line */}
                {index < ORDER_STEPS.length - 1 && (
                  <div 
                    className={cn(
                      "absolute left-5 top-10 w-0.5 h-12 transition-colors duration-500",
                      index < currentStepIndex ? "bg-primary" : "bg-border"
                    )}
                  />
                )}

                {/* Step Icon */}
                <div 
                  className={cn(
                    "relative z-10 h-10 w-10 rounded-full flex items-center justify-center transition-all duration-500",
                    isCompleted 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground",
                    isCurrent && "ring-4 ring-primary/20 animate-pulse"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Step Content */}
                <div className={cn("pb-8 flex-1", index === ORDER_STEPS.length - 1 && "pb-0")}>
                  <p className={cn(
                    "font-semibold transition-colors",
                    isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.label}
                  </p>
                  
                  {isCurrent && step.status === 'placed' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Waiting for restaurant to accept
                    </p>
                  )}
                  
                  {isCurrent && step.status === 'accepted' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Restaurant confirmed your order
                    </p>
                  )}
                  
                  {isCurrent && step.status === 'preparing' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Chef is preparing your food
                    </p>
                  )}
                  
                  {isCurrent && step.status === 'on_the_way' && order.agentName && (
                    <div className="mt-2 bg-muted rounded-lg p-3">
                      <p className="text-sm font-medium text-foreground">{order.agentName}</p>
                      <p className="text-xs text-muted-foreground">is on the way with your order</p>
                      <Button variant="outline" size="sm" className="mt-2 gap-2">
                        <Phone className="h-3 w-3" />
                        Call Agent
                      </Button>
                    </div>
                  )}
                  
                  {step.status === 'delivered' && order.status === 'delivered' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Delivered at {order.deliveredAt?.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Summary */}
      <div className="border-t border-border p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {order.items.length} item{order.items.length > 1 ? 's' : ''} from {order.restaurantName}
          </span>
          <span className="font-bold text-foreground">₹{order.totalAmount}</span>
        </div>
      </div>
    </div>
  );
}
