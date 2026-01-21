import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, UtensilsCrossed } from 'lucide-react';
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

// Import food images
import masalaDosa from '@/assets/food/masala-dosa.jpg';
import butterChicken from '@/assets/food/butter-chicken.jpg';
import paneerButterMasala from '@/assets/food/paneer-butter-masala.jpg';
import tandooriChicken from '@/assets/food/tandoori-chicken.jpg';
import dalMakhani from '@/assets/food/dal-makhani.jpg';

// Mock data
const mockItems = [
  { id: '1', name: 'Masala Dosa', image: masalaDosa, restaurant: 'Spice Garden', category: 'Main Course', price: 80, isVeg: true, isAvailable: true },
  { id: '2', name: 'Butter Chicken', image: butterChicken, restaurant: 'Royal Dhaba', category: 'Main Course', price: 280, isVeg: false, isAvailable: true },
  { id: '3', name: 'Paneer Butter Masala', image: paneerButterMasala, restaurant: 'Royal Dhaba', category: 'Main Course', price: 220, isVeg: true, isAvailable: true },
  { id: '4', name: 'Tandoori Chicken', image: tandooriChicken, restaurant: 'Royal Dhaba', category: 'Starters', price: 260, isVeg: false, isAvailable: true },
  { id: '5', name: 'Dal Makhani', image: dalMakhani, restaurant: 'Royal Dhaba', category: 'Main Course', price: 180, isVeg: true, isAvailable: false },
];

const restaurants = ['Spice Garden', 'Royal Dhaba', 'Taste of Village', 'Kavuru Kitchen', 'Biryani House'];
const categories = ['Starters', 'Main Course', 'Biryanis', 'Breads', 'Beverages', 'Desserts'];

export default function AdminMenuItems() {
  const [items, setItems] = useState(mockItems);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<typeof mockItems[0] | null>(null);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.restaurant.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem = {
      id: editingItem?.id || Date.now().toString(),
      name: formData.get('name') as string,
      image: editingItem?.image || masalaDosa,
      restaurant: formData.get('restaurant') as string,
      category: formData.get('category') as string,
      price: parseInt(formData.get('price') as string) || 0,
      isVeg: formData.get('isVeg') === 'on',
      isAvailable: true,
    };

    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? newItem : i));
    } else {
      setItems(prev => [...prev, newItem]);
    }
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const toggleAvailable = (id: string) => {
    setItems(prev => prev.map(i => 
      i.id === id ? { ...i, isAvailable: !i.isAvailable } : i
    ));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Menu Items</h1>
          <p className="text-muted-foreground">Manage food items across restaurants</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingItem(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="name">Item Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  defaultValue={editingItem?.name}
                  placeholder="e.g., Butter Chicken" 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="restaurant">Restaurant</Label>
                <Select name="restaurant" defaultValue={editingItem?.restaurant || restaurants[0]}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select restaurant" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue={editingItem?.category || categories[0]}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input 
                  id="price" 
                  name="price" 
                  type="number"
                  defaultValue={editingItem?.price}
                  placeholder="e.g., 250" 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Brief description of the dish"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch id="isVeg" name="isVeg" defaultChecked={editingItem?.isVeg} />
                <Label htmlFor="isVeg">Vegetarian</Label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? 'Update' : 'Create'}
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
          placeholder="Search items..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className={!item.isAvailable ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className={`absolute -top-1 -left-1 h-4 w-4 border-2 rounded flex items-center justify-center bg-card ${item.isVeg ? 'border-veg' : 'border-non-veg'}`}>
                    <div className={`h-2 w-2 rounded-full ${item.isVeg ? 'bg-veg' : 'bg-non-veg'}`} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.restaurant} • {item.category}</p>
                    </div>
                    <span className="font-bold text-foreground">₹{item.price}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={item.isAvailable} 
                        onCheckedChange={() => toggleAvailable(item.id)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setEditingItem(item); setDialogOpen(true); }}>
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDelete(item.id)}>
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

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No menu items found</p>
        </div>
      )}
    </div>
  );
}
