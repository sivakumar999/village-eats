import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { LocationProvider } from "@/context/LocationContext";
import { OrderProvider } from "@/context/OrderContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute, OptionalAuth } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import RestaurantDetail from "./pages/RestaurantDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderStatus from "./pages/OrderStatus";
import MyOrders from "./pages/MyOrders";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerDashboard from "./pages/CustomerDashboard";
import NotFound from "./pages/NotFound";
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

const queryClient = new QueryClient();

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
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Customer Routes (public with optional auth) */}
                  <Route path="/" element={<OptionalAuth><Index /></OptionalAuth>} />
                  <Route path="/restaurant/:id" element={<OptionalAuth><RestaurantDetail /></OptionalAuth>} />
                  <Route path="/cart" element={<OptionalAuth><Cart /></OptionalAuth>} />
                  
                  {/* Protected Customer Routes */}
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
                      <MyOrders />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute roles={['CUSTOMER']}>
                      <CustomerDashboard />
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
