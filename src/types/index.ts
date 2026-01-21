export interface Location {
  id: string;
  name: string;
  distance?: number; // in km from user
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  cuisine: string[];
  rating: number;
  deliveryTime: string;
  priceRange: string;
  locationId: string;
  distance?: number;
  isOpen: boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  restaurantId: string;
  category: string;
  isVeg: boolean;
  isSpicy?: boolean;
  isBestseller?: boolean;
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  status: 'placed' | 'accepted' | 'on_the_way' | 'delivered';
  totalAmount: number;
  deliveryFee: number;
  restaurantId: string;
  customerId: string;
  agentId?: string;
  createdAt: Date;
}

export interface DeliveryFee {
  baseFee: number;
  distanceFee: number;
  total: number;
  itemDiscount?: number;
}
