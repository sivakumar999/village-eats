import { useState } from 'react';
import { Search, ShoppingBag, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// Mock data
const mockOrders = [
  { 
    id: '1', 
    orderNumber: 'VE202401150001', 
    customer: 'Ravi Kumar', 
    restaurant: 'Spice Garden',
    items: 3,
    amount: 380, 
    status: 'delivered', 
    agent: 'Raju Kumar',
    placedAt: '2024-01-15 10:30 AM',
    deliveredAt: '2024-01-15 11:05 AM',
  },
  { 
    id: '2', 
    orderNumber: 'VE202401150002', 
    customer: 'Lakshmi Devi', 
    restaurant: 'Royal Dhaba',
    items: 2,
    amount: 520, 
    status: 'on_the_way', 
    agent: 'Venkat Reddy',
    placedAt: '2024-01-15 11:15 AM',
  },
  { 
    id: '3', 
    orderNumber: 'VE202401150003', 
    customer: 'Venkat Reddy', 
    restaurant: 'Biryani House',
    items: 1,
    amount: 290, 
    status: 'preparing', 
    agent: null,
    placedAt: '2024-01-15 11:25 AM',
  },
  { 
    id: '4', 
    orderNumber: 'VE202401150004', 
    customer: 'Sita Rani', 
    restaurant: 'Taste of Village',
    items: 4,
    amount: 450, 
    status: 'placed', 
    agent: null,
    placedAt: '2024-01-15 11:40 AM',
  },
  { 
    id: '5', 
    orderNumber: 'VE202401140012', 
    customer: 'Krishna Rao', 
    restaurant: 'Royal Dhaba',
    items: 2,
    amount: 340, 
    status: 'cancelled', 
    agent: null,
    placedAt: '2024-01-14 08:30 PM',
  },
];

const statusColors: Record<string, string> = {
  placed: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-blue-100 text-blue-700',
  preparing: 'bg-orange-100 text-orange-700',
  on_the_way: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  placed: 'Placed',
  accepted: 'Accepted',
  preparing: 'Preparing',
  on_the_way: 'On the Way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function AdminOrders() {
  const [orders] = useState(mockOrders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase()) ||
      order.restaurant.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground">View and manage all orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by order ID, customer, or restaurant..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="placed">Placed</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="on_the_way">On the Way</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{order.orderNumber}</h3>
                      <Badge className={statusColors[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                    <p className="text-sm text-muted-foreground">{order.restaurant} • {order.items} items</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:text-right">
                  <div>
                    <p className="font-bold text-foreground">₹{order.amount}</p>
                    <p className="text-xs text-muted-foreground">{order.placedAt}</p>
                    {order.agent && (
                      <p className="text-xs text-muted-foreground">Agent: {order.agent}</p>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No orders found</p>
        </div>
      )}
    </div>
  );
}
