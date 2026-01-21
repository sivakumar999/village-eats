import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const earnings = [
  { date: 'Today', deliveries: 5, amount: 145 },
  { date: 'Yesterday', deliveries: 8, amount: 210 },
  { date: 'Jan 13', deliveries: 6, amount: 165 },
];
const summary = { total: 2450, pending: 520, paid: 1930 };

export default function AgentEarnings() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">My Earnings</h1>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">₹{summary.total}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">₹{summary.pending}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">₹{summary.paid}</p><p className="text-xs text-muted-foreground">Paid</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Recent Earnings</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {earnings.map((e, i) => (
            <div key={i} className="flex justify-between py-2 border-b last:border-0">
              <div><p className="font-medium">{e.date}</p><p className="text-sm text-muted-foreground">{e.deliveries} deliveries</p></div>
              <p className="font-bold">₹{e.amount}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
