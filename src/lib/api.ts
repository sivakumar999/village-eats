// API Service Layer for Village Eats
import { 
  User, Location, Restaurant, FoodItem, Order, OrderStatus, 
  Agent, AgentEarning, AgentEarningsSummary, DashboardStats, AppSetting,
  ApiResponse, PaginatedResponse 
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ============= Auth Token Management =============

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

export const getAuthToken = (): string | null => {
  if (!authToken) {
    authToken = localStorage.getItem('auth_token');
  }
  return authToken;
};

// ============= Base Fetch Wrapper =============

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  const token = getAuthToken();
  if (token && !skipAuth) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

// ============= Auth API =============

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  locationId?: string;
  address?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    return apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      skipAuth: true,
    });
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    return apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      skipAuth: true,
    });
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    return apiFetch<ApiResponse<User>>('/auth/me');
  },

  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    return apiFetch<ApiResponse<User>>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ============= Locations API =============

export const locationsApi = {
  getAll: async (): Promise<ApiResponse<Location[]>> => {
    return apiFetch<ApiResponse<Location[]>>('/locations', { skipAuth: true });
  },

  getById: async (id: string): Promise<ApiResponse<Location>> => {
    return apiFetch<ApiResponse<Location>>(`/locations/${id}`, { skipAuth: true });
  },

  getDistance: async (fromId: string, toId: string): Promise<ApiResponse<{ distance: number }>> => {
    return apiFetch<ApiResponse<{ distance: number }>>(`/locations/${fromId}/distance/${toId}`, { skipAuth: true });
  },

  create: async (data: Partial<Location>): Promise<ApiResponse<Location>> => {
    return apiFetch<ApiResponse<Location>>('/locations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<Location>): Promise<ApiResponse<Location>> => {
    return apiFetch<ApiResponse<Location>>(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ============= Restaurants API =============

export const restaurantsApi = {
  getAll: async (params?: { locationId?: string }): Promise<ApiResponse<Restaurant[]>> => {
    const searchParams = new URLSearchParams();
    if (params?.locationId) searchParams.set('locationId', params.locationId);
    const query = searchParams.toString();
    return apiFetch<ApiResponse<Restaurant[]>>(`/restaurants${query ? `?${query}` : ''}`, { skipAuth: true });
  },

  getById: async (id: string): Promise<ApiResponse<Restaurant & { menu: FoodItem[] }>> => {
    return apiFetch<ApiResponse<Restaurant & { menu: FoodItem[] }>>(`/restaurants/${id}`, { skipAuth: true });
  },

  getMenu: async (id: string): Promise<ApiResponse<FoodItem[]>> => {
    return apiFetch<ApiResponse<FoodItem[]>>(`/restaurants/${id}/menu`, { skipAuth: true });
  },

  create: async (data: Partial<Restaurant>): Promise<ApiResponse<Restaurant>> => {
    return apiFetch<ApiResponse<Restaurant>>('/restaurants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<Restaurant>): Promise<ApiResponse<Restaurant>> => {
    return apiFetch<ApiResponse<Restaurant>>(`/restaurants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  addMenuItem: async (restaurantId: string, item: Partial<FoodItem>): Promise<ApiResponse<FoodItem>> => {
    return apiFetch<ApiResponse<FoodItem>>(`/restaurants/${restaurantId}/menu`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },
};

// ============= Orders API =============

export interface PlaceOrderRequest {
  restaurantId: string;
  deliveryLocationId: string;
  deliveryAddress: string;
  paymentModeId: number; // 1 = COD, 2 = ONLINE
  customerNotes?: string;
  items: { foodItemId: string; quantity: number }[];
}

export const ordersApi = {
  place: async (orderData: PlaceOrderRequest): Promise<ApiResponse<Order>> => {
    return apiFetch<ApiResponse<Order>>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  getMyOrders: async (): Promise<ApiResponse<Order[]>> => {
    return apiFetch<ApiResponse<Order[]>>('/orders');
  },

  getById: async (id: string): Promise<ApiResponse<Order>> => {
    return apiFetch<ApiResponse<Order>>(`/orders/${id}`);
  },

  cancel: async (id: string): Promise<ApiResponse<Order>> => {
    return apiFetch<ApiResponse<Order>>(`/orders/${id}/cancel`, {
      method: 'PUT',
    });
  },

  // Admin only
  getAll: async (): Promise<ApiResponse<Order[]>> => {
    return apiFetch<ApiResponse<Order[]>>('/orders/admin/all');
  },
};

// ============= Agents API =============

export const agentsApi = {
  getAvailableOrders: async (): Promise<ApiResponse<Order[]>> => {
    return apiFetch<ApiResponse<Order[]>>('/agents/available-orders');
  },

  acceptOrder: async (orderId: string): Promise<ApiResponse<Order>> => {
    return apiFetch<ApiResponse<Order>>(`/agents/accept-order/${orderId}`, {
      method: 'POST',
    });
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<ApiResponse<Order>> => {
    return apiFetch<ApiResponse<Order>>(`/agents/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  getMyOrders: async (): Promise<ApiResponse<Order[]>> => {
    return apiFetch<ApiResponse<Order[]>>('/agents/my-orders');
  },

  getEarnings: async (startDate?: string, endDate?: string): Promise<ApiResponse<{
    daily: AgentEarning[];
    summary: AgentEarningsSummary;
  }>> => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    const query = params.toString();
    return apiFetch<ApiResponse<{ daily: AgentEarning[]; summary: AgentEarningsSummary }>>(`/agents/earnings${query ? `?${query}` : ''}`);
  },

  toggleAvailability: async (isAvailable: boolean): Promise<ApiResponse<Agent>> => {
    return apiFetch<ApiResponse<Agent>>('/agents/availability', {
      method: 'PUT',
      body: JSON.stringify({ isAvailable }),
    });
  },

  getProfile: async (): Promise<ApiResponse<Agent>> => {
    return apiFetch<ApiResponse<Agent>>('/agents/profile');
  },

  updateLocation: async (latitude: number, longitude: number): Promise<ApiResponse<void>> => {
    return apiFetch<ApiResponse<void>>('/agents/location', {
      method: 'PUT',
      body: JSON.stringify({ latitude, longitude }),
    });
  },

  // Admin only
  getAll: async (): Promise<ApiResponse<Agent[]>> => {
    return apiFetch<ApiResponse<Agent[]>>('/agents/admin/all');
  },
};

// ============= Admin API =============

export const adminApi = {
  getDashboard: async (): Promise<ApiResponse<DashboardStats>> => {
    return apiFetch<ApiResponse<DashboardStats>>('/admin/dashboard');
  },

  getSettings: async (): Promise<ApiResponse<AppSetting[]>> => {
    return apiFetch<ApiResponse<AppSetting[]>>('/admin/settings');
  },

  updateSettings: async (settings: AppSetting[]): Promise<ApiResponse<AppSetting[]>> => {
    return apiFetch<ApiResponse<AppSetting[]>>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    });
  },

  getUsers: async (): Promise<ApiResponse<User[]>> => {
    return apiFetch<ApiResponse<User[]>>('/admin/users');
  },

  createAgent: async (agentData: Partial<Agent & User>): Promise<ApiResponse<Agent>> => {
    return apiFetch<ApiResponse<Agent>>('/admin/agents', {
      method: 'POST',
      body: JSON.stringify(agentData),
    });
  },

  getOrderReports: async (startDate?: string, endDate?: string): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    const query = params.toString();
    return apiFetch<ApiResponse<any>>(`/admin/reports/orders${query ? `?${query}` : ''}`);
  },

  getAgentReports: async (): Promise<ApiResponse<any>> => {
    return apiFetch<ApiResponse<any>>('/admin/reports/agents');
  },
};
