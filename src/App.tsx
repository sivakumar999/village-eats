import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { LocationProvider } from "@/context/LocationContext";
import { OrderProvider } from "@/context/OrderContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Landing & Auth
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Customer Pages
import CustomerHome from "./pages/customer/CustomerHome";
import CustomerOrders from "./pages/customer/CustomerOrders";
import CustomerProfile from "./pages/customer/CustomerProfile";
import RestaurantDetail from "./pages/RestaurantDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderStatus from "./pages/OrderStatus";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLocations from "./pages/admin/AdminLocations";
import AdminRestaurants from "./pages/admin/AdminRestaurants";
import AdminMenuItems from "./pages/admin/AdminMenuItems";
import AdminAgents from "./pages/admin/AdminAgents";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminSettings from "./pages/admin/AdminSettings";

// Agent
import AgentLayout from "./pages/agent/AgentLayout";
import AgentDashboard from "./pages/agent/AgentDashboard";
import AgentOrders from "./pages/agent/AgentOrders";
import AgentEarnings from "./pages/agent/AgentEarnings";
import AgentProfile from "./pages/agent/AgentProfile";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Root redirect based on auth status
function RootRedirect() {
  const { isAuthenticated, user, hasRole } = useAuth();
  
  if (!isAuthenticated) {
    return <Landing />;
  }
  
  // Redirect to role-specific dashboard
  if (hasRole('ADMIN')) {
    return <Navigate to="/admin" replace />;
  }
  if (hasRole('AGENT')) {
    return <Navigate to="/agent" replace />;
  }
  // Default to customer
  return <Navigate to="/home" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LocationProvider>
          <CartProvider>
            <OrderProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Root - Landing or redirect to dashboard */}
                  <Route path="/" element={<RootRedirect />} />
                  
                  {/* Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Customer Routes */}
                  <Route path="/home" element={
                    <ProtectedRoute roles={['CUSTOMER']}>
                      <CustomerHome />
                    </ProtectedRoute>
                  } />
                  <Route path="/restaurant/:id" element={
                    <ProtectedRoute roles={['CUSTOMER']}>
                      <RestaurantDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/cart" element={
                    <ProtectedRoute roles={['CUSTOMER']}>
                      <Cart />
                    </ProtectedRoute>
                  } />
                  <Route path="/checkout" element={
                    <ProtectedRoute roles={['CUSTOMER']}>
                      <Checkout />
                    </ProtectedRoute>
                  } />
                  <Route path="/order/:orderId" element={
                    <ProtectedRoute roles={['CUSTOMER']}>
                      <OrderStatus />
                    </ProtectedRoute>
                  } />
                  <Route path="/my-orders" element={
                    <ProtectedRoute roles={['CUSTOMER']}>
                      <CustomerOrders />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute roles={['CUSTOMER']}>
                      <CustomerProfile />
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={
                    <ProtectedRoute roles={['ADMIN']}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="locations" element={<AdminLocations />} />
                    <Route path="restaurants" element={<AdminRestaurants />} />
                    <Route path="menu-items" element={<AdminMenuItems />} />
                    <Route path="agents" element={<AdminAgents />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>
                  
                  {/* Agent Routes */}
                  <Route path="/agent" element={
                    <ProtectedRoute roles={['AGENT']}>
                      <AgentLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<AgentDashboard />} />
                    <Route path="orders" element={<AgentOrders />} />
                    <Route path="earnings" element={<AgentEarnings />} />
                    <Route path="profile" element={<AgentProfile />} />
                  </Route>
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </OrderProvider>
          </CartProvider>
        </LocationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
