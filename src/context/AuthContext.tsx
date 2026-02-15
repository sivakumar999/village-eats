import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthState } from '@/types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; phone?: string; locationId?: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS: (User & { password: string })[] = [
  {
    id: 'cust-001',
    email: 'customer@villageeats.com',
    password: 'password',
    name: 'Ravi Kumar',
    phone: '9876543210',
    locationId: '1',
    locationName: 'Cherukupalli',
    address: 'Main Road, Near Temple, Cherukupalli',
    roles: ['CUSTOMER'],
    isActive: true,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'agent-001',
    email: 'agent@villageeats.com',
    password: 'password',
    name: 'Sunny',
    phone: '9876543211',
    locationId: '1',
    locationName: 'Cherukupalli',
    address: 'Bus Stand, Cherukupalli',
    roles: ['AGENT'],
    isActive: true,
    createdAt: new Date('2024-01-10'),
  },
  {
    id: 'admin-001',
    email: 'admin@villageeats.com',
    password: 'password',
    name: 'Admin User',
    phone: '9876543212',
    locationId: '1',
    locationName: 'Cherukupalli',
    address: 'Office, Cherukupalli',
    roles: ['ADMIN'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('ve_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        // Restore Date object
        user.createdAt = new Date(user.createdAt);
        setState({
          user,
          token: 'mock-token',
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem('ve_user');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockUser = MOCK_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!mockUser) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw new Error('Invalid email or password. Try: customer@villageeats.com / password');
    }

    const { password: _, ...user } = mockUser;
    localStorage.setItem('ve_user', JSON.stringify(user));

    setState({
      user,
      token: 'mock-token',
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const register = useCallback(async (data: { email: string; password: string; name: string; phone?: string; locationId?: string }) => {
    setState(prev => ({ ...prev, isLoading: true }));

    await new Promise(resolve => setTimeout(resolve, 800));

    // Check if email already exists
    if (MOCK_USERS.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw new Error('Email already registered');
    }

    const newUser: User = {
      id: `cust-${Date.now()}`,
      email: data.email,
      name: data.name,
      phone: data.phone,
      locationId: data.locationId,
      address: '',
      roles: ['CUSTOMER'],
      isActive: true,
      createdAt: new Date(),
    };

    localStorage.setItem('ve_user', JSON.stringify(newUser));

    setState({
      user: newUser,
      token: 'mock-token',
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ve_user');
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    setState(prev => {
      if (!prev.user) return prev;
      const updatedUser = { ...prev.user, ...data };
      localStorage.setItem('ve_user', JSON.stringify(updatedUser));
      return { ...prev, user: updatedUser };
    });
  }, []);

  const hasRole = useCallback((role: UserRole): boolean => {
    return state.user?.roles.includes(role) ?? false;
  }, [state.user]);

  const hasAnyRole = useCallback((...roles: UserRole[]): boolean => {
    return roles.some(role => state.user?.roles.includes(role));
  }, [state.user]);

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      updateProfile,
      hasRole,
      hasAnyRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
