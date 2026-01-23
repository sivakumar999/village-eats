import { useEffect, useState } from 'react';
import { Order, OrderStatus } from '@/types';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Package, Check, ChefHat, Bike, MapPin, Phone, 
  RefreshCw, Wifi, WifiOff, Navigation
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveOrderTrackerProps {
  orderId: string;
  onStatusChange?: (status: OrderStatus) => void;
}

const ORDER_STEPS = [
  { status: 'placed' as OrderStatus, label: 'Order Placed', icon: Package },
  { status: 'accepted' as OrderStatus, label: 'Accepted', icon: Check },
  { status: 'preparing' as OrderStatus, label: 'Preparing', icon: ChefHat },
  { status: 'on_the_way' as OrderStatus, label: 'On the Way', icon: Bike },
  { status: 'delivered' as OrderStatus, label: 'Delivered', icon: MapPin },
];

function getStepIndex(status: OrderStatus): number {
  const idx = ORDER_STEPS.findIndex(s => s.status === status);
  return idx === -1 ? -1 : idx;
}

export function LiveOrderTracker({ orderId, onStatusChange }: LiveOrderTrackerProps) {
  const { order, isLoading, error, agentLocation, isConnected, refetch } = useOrderTracking(orderId);
  const [prevStatus, setPrevStatus] = useState<OrderStatus | null>(null);

  // Notify parent of status changes
  useEffect(() => {
    if (order && order.status !== prevStatus) {
      setPrevStatus(order.status);
      onStatusChange?.(order.status);
    }
  }, [order?.status, prevStatus, onStatusChange]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    );
  }

  if (error || !order) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="py-8 text-center">
          <p className="text-destructive mb-4">{error || 'Order not found'}</p>
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Handle cancelled orders
  if (order.status === 'cancelled') {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Cancelled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This order was cancelled{order.cancelledAt && ` on ${new Date(order.cancelledAt).toLocaleDateString()}`}
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentStepIndex = getStepIndex(order.status);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-display">
              Order #{order.orderNumber}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {order.restaurantName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Connection status indicator */}
            <Badge variant={isConnected ? "default" : "secondary"} className="gap-1">
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3" />
                  Live
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  Offline
                </>
              )}
            </Badge>
            <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
              {ORDER_STEPS.find(s => s.status === order.status)?.label || order.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Steps */}
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-5 right-5 h-0.5 bg-muted" />
          <div 
            className="absolute top-5 left-5 h-0.5 bg-primary transition-all duration-500"
            style={{ width: `${(currentStepIndex / (ORDER_STEPS.length - 1)) * 100}%` }}
          />

          {/* Steps */}
          <div className="relative flex justify-between">
            {ORDER_STEPS.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const Icon = step.icon;

              return (
                <div key={step.status} className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                      isCurrent && "ring-4 ring-primary/20 scale-110"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={cn(
                      "text-xs mt-2 text-center max-w-[60px]",
                      isCompleted ? "text-foreground font-medium" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Agent Info & Live Location */}
        {order.agentName && (order.status === 'accepted' || order.status === 'preparing' || order.status === 'on_the_way') && (
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bike className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{order.agentName}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.status === 'on_the_way' ? 'On the way to you' : 'Assigned to your order'}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Phone className="h-4 w-4" />
                Call
              </Button>
            </div>

            {/* Live Location Indicator */}
            {agentLocation && order.status === 'on_the_way' && (
              <div className="mt-4 p-3 bg-background rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 text-sm">
                  <Navigation className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-primary font-medium">Live Location Active</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {new Date(agentLocation.updatedAt).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Delivery Address */}
        <div className="flex items-start gap-3 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium">Delivery Address</p>
            <p className="text-muted-foreground">{order.deliveryAddress}</p>
          </div>
        </div>

        {/* Order Total */}
        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-muted-foreground">Total Amount</span>
          <span className="text-lg font-bold">₹{order.totalAmount}</span>
        </div>
      </CardContent>
    </Card>
  );
}
