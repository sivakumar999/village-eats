import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Store, Star } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

// Import restaurant images
import spiceGarden from '@/assets/restaurants/spice-garden.jpg';
import royalDhaba from '@/assets/restaurants/royal-dhaba.jpg';
import tasteOfVillage from '@/assets/restaurants/taste-of-village.jpg';
import kavuruKitchen from '@/assets/restaurants/kavuru-kitchen.jpg';
import biryaniHouse from '@/assets/restaurants/biryani-house.jpg';

// Mock data
const mockRestaurants = [
  { id: '1', name: 'Spice Garden', image: spiceGarden, location: 'Cherukupalli', cuisine: 'South Indian, Andhra', rating: 4.3, isOpen: true },
  { id: '2', name: 'Royal Dhaba', image: royalDhaba, location: 'Cherukupalli', cuisine: 'North Indian, Punjabi', rating: 4.5, isOpen: true },
  { id: '3', name: 'Taste of Village', image: tasteOfVillage, location: 'Kavuru', cuisine: 'Andhra, Traditional', rating: 4.2, isOpen: true },
  { id: '4', name: 'Kavuru Kitchen', image: kavuruKitchen, location: 'Kavuru', cuisine: 'Fusion, Multi-cuisine', rating: 4.0, isOpen: false },
  { id: '5', name: 'Biryani House', image: biryaniHouse, location: 'Repallee', cuisine: 'Hyderabadi, Biryani', rating: 4.6, isOpen: true },
];

const locations = ['Cherukupalli', 'Kavuru', 'Repallee', 'Chinikollu', 'Tenaali'];

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState(mockRestaurants);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<typeof mockRestaurants[0] | null>(null);

  const filteredRestaurants = restaurants.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newRestaurant = {
      id: editingRestaurant?.id || Date.now().toString(),
      name: formData.get('name') as string,
      image: editingRestaurant?.image || spiceGarden,
      location: formData.get('location') as string,
      cuisine: formData.get('cuisine') as string,
      rating: editingRestaurant?.rating || 4.0,
      isOpen: true,
    };

    if (editingRestaurant) {
      setRestaurants(prev => prev.map(r => r.id === editingRestaurant.id ? newRestaurant : r));
    } else {
      setRestaurants(prev => [...prev, newRestaurant]);
    }
    setDialogOpen(false);
    setEditingRestaurant(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this restaurant?')) {
      setRestaurants(prev => prev.filter(r => r.id !== id));
    }
  };

  const toggleOpen = (id: string) => {
    setRestaurants(prev => prev.map(r => 
      r.id === id ? { ...r, isOpen: !r.isOpen } : r
    ));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Restaurants</h1>
          <p className="text-muted-foreground">Manage restaurant listings</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingRestaurant(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Restaurant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="name">Restaurant Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  defaultValue={editingRestaurant?.name}
                  placeholder="e.g., Spice Garden" 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Select name="location" defaultValue={editingRestaurant?.location || locations[0]}>
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
                <Label htmlFor="cuisine">Cuisine Types</Label>
                <Input 
                  id="cuisine" 
                  name="cuisine" 
                  defaultValue={editingRestaurant?.cuisine}
                  placeholder="e.g., South Indian, Andhra" 
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Brief description of the restaurant"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingRestaurant ? 'Update' : 'Create'}
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
          placeholder="Search restaurants..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Restaurants List */}
      <div className="space-y-4">
        {filteredRestaurants.map((restaurant) => (
          <Card key={restaurant.id} className={!restaurant.isOpen ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <img 
                  src={restaurant.image} 
                  alt={restaurant.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{restaurant.name}</h3>
                      <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
                      <p className="text-sm text-muted-foreground">{restaurant.location}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-accent px-2 py-1 rounded">
                      <Star className="h-3 w-3 fill-accent-foreground text-accent-foreground" />
                      <span className="text-sm font-medium text-accent-foreground">{restaurant.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={restaurant.isOpen} 
                        onCheckedChange={() => toggleOpen(restaurant.id)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {restaurant.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setEditingRestaurant(restaurant); setDialogOpen(true); }}>
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDelete(restaurant.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRestaurants.length === 0 && (
        <div className="text-center py-12">
          <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No restaurants found</p>
        </div>
      )}
    </div>
  );
}
