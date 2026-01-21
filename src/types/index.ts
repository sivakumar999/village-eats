// ============= Location Types =============

export interface Location {
  id: string;
  name: string;
  district?: string;
  pinCode?: string;
  distance?: number; // in km from user's location
  isActive?: boolean;
}

// ============= Restaurant Types =============

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  image: string;
  cuisine: string[];
  rating: number;
  totalRatings?: number;
  deliveryTime: string;
  priceRange: string;
  locationId: string;
  locationName?: string;
  distance?: number;
  isOpen: boolean;
  openingTime?: string;
  closingTime?: string;
}

// ============= Food Item Types =============

export interface FoodCategory {
  id: string;
  name: string;
  description?: string;
  displayOrder?: number;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  restaurantId: string;
  category: string;
  categoryId?: string;
  isVeg: boolean;
  isSpicy?: boolean;
  isBestseller?: boolean;
  isAvailable?: boolean;
  preparationTime?: number;
}

// ============= Cart Types =============

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}

export interface DeliveryFee {
  baseFee: number;
  distanceFee: number;
  total: number;
  itemDiscount?: number;
  isSameVillage?: boolean;
}

// ============= Order Types =============

export type OrderStatus = 'placed' | 'accepted' | 'preparing' | 'on_the_way' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  foodItemId: string;
  foodItemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  status: OrderStatus;
  
  // Customer info
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  
  // Restaurant info
  restaurantId: string;
  restaurantName?: string;
  
  // Delivery info
  agentId?: string;
  agentName?: string;
  deliveryLocationId: string;
  deliveryAddress: string;
  deliveryDistance?: number;
  isSameVillage: boolean;
  
  // Pricing
  itemTotal: number;
  deliveryBaseFee: number;
  deliveryDistanceFee: number;
  multiItemDiscount: number;
  totalAmount: number;
  
  // Payment
  paymentMode: 'COD' | 'ONLINE';
  paymentStatus: 'pending' | 'completed' | 'failed';
  
  // Timestamps
  placedAt: Date;
  acceptedAt?: Date;
  preparedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  
  customerNotes?: string;
}

// ============= User & Auth Types =============

export type UserRole = 'CUSTOMER' | 'ADMIN' | 'AGENT';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  locationId?: string;
  locationName?: string;
  address?: string;
  roles: UserRole[];
  isActive: boolean;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ============= Agent Types =============

export interface Agent {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: 'BIKE' | 'SCOOTER' | 'CYCLE';
  licenseNumber?: string;
  assignedLocationId: string;
  assignedLocationName?: string;
  isAvailable: boolean;
  currentLatitude?: number;
  currentLongitude?: number;
  totalDeliveries: number;
  rating: number;
  lastActiveAt?: Date;
}

export interface AgentEarning {
  id: string;
  orderId: string;
  orderNumber: string;
  baseEarning: number;
  distanceBonus: number;
  platformFee: number;
  totalEarning: number;
  isPaid: boolean;
  paidAt?: Date;
  createdAt: Date;
}

export interface AgentEarningsSummary {
  totalDeliveries: number;
  totalEarning: number;
  baseEarnings: number;
  distanceBonuses: number;
  platformFees: number;
  paidAmount: number;
  pendingAmount: number;
}

// ============= Admin Types =============

export interface AppSetting {
  key: string;
  value: string;
  description: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalAgents: number;
  activeAgents: number;
  pendingOrders: number;
  todayOrders: number;
  todayRevenue: number;
}

// ============= API Response Types =============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
