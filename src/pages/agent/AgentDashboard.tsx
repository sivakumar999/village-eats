import { ShoppingBag, IndianRupee, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const stats = { todayDeliveries: 5, todayEarnings: 145, pendingOrders: 3, weekEarnings: 820 };

export default function AgentDashboard() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Welcome, Raju! 👋</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Today</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.todayDeliveries}</div><p className="text-xs text-muted-foreground">deliveries</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Earned Today</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">₹{stats.todayEarnings}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-primary">{stats.pendingOrders}</div><p className="text-xs text-muted-foreground">orders nearby</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">This Week</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">₹{stats.weekEarnings}</div></CardContent></Card>
      </div>
      <Link to="/agent/orders"><Button className="w-full" size="lg"><ShoppingBag className="h-5 w-5 mr-2" />View Available Orders</Button></Link>
    </div>
  );
}
