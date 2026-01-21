import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

// Mock data - replace with API
const mockLocations = [
  { id: '1', name: 'Cherukupalli', district: 'Guntur', pinCode: '522259', isActive: true },
  { id: '2', name: 'Kavuru', district: 'Guntur', pinCode: '522261', isActive: true },
  { id: '3', name: 'Repallee', district: 'Guntur', pinCode: '522265', isActive: true },
  { id: '4', name: 'Chinikollu', district: 'Guntur', pinCode: '522256', isActive: true },
  { id: '5', name: 'Tenaali', district: 'Guntur', pinCode: '522201', isActive: false },
];

export default function AdminLocations() {
  const [locations, setLocations] = useState(mockLocations);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<typeof mockLocations[0] | null>(null);

  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(search.toLowerCase()) ||
    loc.district.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newLocation = {
      id: editingLocation?.id || Date.now().toString(),
      name: formData.get('name') as string,
      district: formData.get('district') as string,
      pinCode: formData.get('pinCode') as string,
      isActive: true,
    };

    if (editingLocation) {
      setLocations(prev => prev.map(loc => loc.id === editingLocation.id ? newLocation : loc));
    } else {
      setLocations(prev => [...prev, newLocation]);
    }
    setDialogOpen(false);
    setEditingLocation(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this location?')) {
      setLocations(prev => prev.filter(loc => loc.id !== id));
    }
  };

  const handleEdit = (location: typeof mockLocations[0]) => {
    setEditingLocation(location);
    setDialogOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Locations</h1>
          <p className="text-muted-foreground">Manage delivery areas and villages</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingLocation(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingLocation ? 'Edit Location' : 'Add New Location'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="name">Location Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  defaultValue={editingLocation?.name}
                  placeholder="e.g., Cherukupalli" 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="district">District</Label>
                <Input 
                  id="district" 
                  name="district" 
                  defaultValue={editingLocation?.district}
                  placeholder="e.g., Guntur" 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="pinCode">PIN Code</Label>
                <Input 
                  id="pinCode" 
                  name="pinCode" 
                  defaultValue={editingLocation?.pinCode}
                  placeholder="e.g., 522259" 
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingLocation ? 'Update' : 'Create'}
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
          placeholder="Search locations..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLocations.map((location) => (
          <Card key={location.id} className={!location.isActive ? 'opacity-60' : ''}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{location.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{location.district}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${location.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {location.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">PIN: {location.pinCode}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(location)}>
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(location.id)}>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLocations.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No locations found</p>
        </div>
      )}
    </div>
  );
}
