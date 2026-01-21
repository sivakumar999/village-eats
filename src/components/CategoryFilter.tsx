import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Utensils, Coffee, Pizza, Salad, IceCream, Flame } from 'lucide-react';

const categories = [
  { id: 'all', name: 'All', icon: Utensils },
  { id: 'biryani', name: 'Biryani', icon: Flame },
  { id: 'south-indian', name: 'South Indian', icon: Coffee },
  { id: 'north-indian', name: 'North Indian', icon: Pizza },
  { id: 'healthy', name: 'Healthy', icon: Salad },
  { id: 'desserts', name: 'Desserts', icon: IceCream },
];

interface CategoryFilterProps {
  onCategoryChange?: (category: string) => void;
}

export function CategoryFilter({ onCategoryChange }: CategoryFilterProps) {
  const [activeCategory, setActiveCategory] = useState('all');

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  return (
    <div className="overflow-x-auto scrollbar-hide py-4">
      <div className="flex gap-3 min-w-max px-1">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          
          return (
            <Button
              key={category.id}
              variant={isActive ? "default" : "outline"}
              className={`rounded-full px-5 py-2 h-auto flex items-center gap-2 transition-all ${
                isActive 
                  ? 'shadow-primary' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleCategoryClick(category.id)}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{category.name}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
