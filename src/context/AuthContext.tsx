import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthState } from '@/types';
import { authApi, setAuthToken, getAuthToken } from '@/lib/api';
import { wsService } from '@/lib/websocket';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; phone?: string; locationId?: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const response = await authApi.getMe();
          if (response.success && response.data) {
            setState({
              user: response.data,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
            // Connect WebSocket with auth token
            wsService.connect(token);
            return;
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          setAuthToken(null);
        }
      }
      setState(prev => ({ ...prev, isLoading: false }));
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await authApi.login({ email, password });
      if (response.success && response.data) {
        const { user, token } = response.data;
        setAuthToken(token);
        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        // Connect WebSocket with auth token
        wsService.connect(token);
      }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const register = useCallback(async (data: { email: string; password: string; name: string; phone?: string; locationId?: string }) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await authApi.register(data);
      if (response.success && response.data) {
        const { user, token } = response.data;
        setAuthToken(token);
        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        wsService.connect(token);
      }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    wsService.disconnect();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      const response = await authApi.updateProfile(data);
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          user: response.data!,
        }));
      }
    } catch (error) {
      throw error;
    }
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
