import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Users, Phone, MapPin, Bike } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

// Mock data
const mockAgents = [
  { id: '1', name: 'Raju Kumar', email: 'raju@villageeats.com', phone: '9876543211', location: 'Cherukupalli', vehicleType: 'BIKE', isAvailable: true, totalDeliveries: 145, rating: 4.8 },
  { id: '2', name: 'Venkat Reddy', email: 'venkat@villageeats.com', phone: '9876543212', location: 'Kavuru', vehicleType: 'SCOOTER', isAvailable: true, totalDeliveries: 98, rating: 4.5 },
  { id: '3', name: 'Suresh Babu', email: 'suresh@villageeats.com', phone: '9876543213', location: 'Repallee', vehicleType: 'BIKE', isAvailable: false, totalDeliveries: 67, rating: 4.2 },
  { id: '4', name: 'Krishna Mohan', email: 'krishna@villageeats.com', phone: '9876543214', location: 'Cherukupalli', vehicleType: 'CYCLE', isAvailable: true, totalDeliveries: 34, rating: 4.6 },
];

const locations = ['Cherukupalli', 'Kavuru', 'Repallee', 'Chinikollu', 'Tenaali'];
const vehicleTypes = ['BIKE', 'SCOOTER', 'CYCLE'];

export default function AdminAgents() {
  const [agents, setAgents] = useState(mockAgents);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<typeof mockAgents[0] | null>(null);

  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(search.toLowerCase()) ||
    agent.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAgent = {
      id: editingAgent?.id || Date.now().toString(),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      location: formData.get('location') as string,
      vehicleType: formData.get('vehicleType') as string,
      isAvailable: true,
      totalDeliveries: editingAgent?.totalDeliveries || 0,
      rating: editingAgent?.rating || 5.0,
    };

    if (editingAgent) {
      setAgents(prev => prev.map(a => a.id === editingAgent.id ? newAgent : a));
    } else {
      setAgents(prev => [...prev, newAgent]);
    }
    setDialogOpen(false);
    setEditingAgent(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      setAgents(prev => prev.filter(a => a.id !== id));
    }
  };

  const toggleAvailable = (id: string) => {
    setAgents(prev => prev.map(a => 
      a.id === id ? { ...a, isAvailable: !a.isAvailable } : a
    ));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Delivery Agents</h1>
          <p className="text-muted-foreground">Manage delivery partners</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingAgent(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingAgent ? 'Edit Agent' : 'Add New Agent'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  defaultValue={editingAgent?.name}
                  placeholder="e.g., Raju Kumar" 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  defaultValue={editingAgent?.email}
                  placeholder="e.g., raju@villageeats.com" 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  defaultValue={editingAgent?.phone}
                  placeholder="e.g., 9876543210" 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="location">Assigned Location</Label>
                <Select name="location" defaultValue={editingAgent?.location || locations[0]}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(loc => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Select name="vehicleType" defaultValue={editingAgent?.vehicleType || vehicleTypes[0]}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map(v => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAgent ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search agents..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAgents.map((agent) => (
          <Card key={agent.id} className={!agent.isAvailable ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{agent.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {agent.location}
                    </div>
                  </div>
                </div>
                <Badge variant={agent.isAvailable ? 'default' : 'secondary'}>
                  {agent.isAvailable ? 'Online' : 'Offline'}
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  {agent.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Bike className="h-3 w-3" />
                  {agent.vehicleType}
                </div>
                <div className="flex items-center justify-between">
                  <span>{agent.totalDeliveries} deliveries</span>
                  <span>⭐ {agent.rating}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={agent.isAvailable} 
                    onCheckedChange={() => toggleAvailable(agent.id)}
                  />
                  <span className="text-sm text-muted-foreground">Available</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setEditingAgent(agent); setDialogOpen(true); }}>
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDelete(agent.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No agents found</p>
        </div>
      )}
    </div>
  );
}
