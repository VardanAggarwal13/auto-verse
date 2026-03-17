import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import CarListings from "./pages/CarListings";
import CarDetail from "./pages/CarDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardIndex from "./pages/dashboard/Index";
import ProfilePage from "./pages/dashboard/Profile";
import MyInquiries from "./pages/dashboard/Inquiries";
import WishlistPage from "./pages/dashboard/Wishlist";
import BookingsPage from "./pages/dashboard/Bookings";
import OrdersPage from "./pages/dashboard/Orders";
import NotificationsPage from "./pages/dashboard/Notifications";
import DealerDashboard from "./pages/dashboard/dealer/Index";
import ManageInventory from "./pages/dashboard/dealer/Inventory";
import InquiriesReceived from "./pages/dashboard/dealer/InquiriesReceived";
import BookingRequests from "./pages/dashboard/dealer/BookingRequests";
import SalesHistory from "./pages/dashboard/dealer/SalesHistory";
import OrdersReceived from "./pages/dashboard/dealer/OrdersReceived";
import AdminDashboard from "./pages/dashboard/admin/Index";
import AdminUsers from "./pages/dashboard/admin/Users";
import AdminVehicles from "./pages/dashboard/admin/Vehicles";
import StaffDashboard from "./pages/dashboard/staff/Index";
import AdminReports from "./pages/dashboard/admin/Reports";
import AdminActivity from "./pages/dashboard/admin/Activity";
import StaffServices from "./pages/dashboard/staff/Services";
import StaffInspections from "./pages/dashboard/staff/Inspections";
import PaymentPending from "./pages/dashboard/PaymentPending";
import { useAuth } from "./hooks/useAuth";

import { toast } from "sonner";
import { io } from "socket.io-client";
import { useEffect } from "react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

const RoleRoute = ({ roles, children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (Array.isArray(roles) && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      const isLocalhost =
        window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const defaultSocketUrl = isLocalhost
        ? "http://localhost:5000"
        : "https://auto-verse1.onrender.com";

      const socketUrl = import.meta.env.VITE_SOCKET_URL || defaultSocketUrl;
      const socket = io(socketUrl);
      socket.emit("join", user.id);

      socket.on("notification", (data) => {
        toast.info(data.message || "New notification received!");
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user?.id]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/cars" element={<CarListings />} />
            <Route path="/cars/:id" element={<CarDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardIndex />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/profile" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProfilePage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/dashboard/inquiries" element={
              <RoleRoute roles={["customer"]}>
                <DashboardLayout>
                  <MyInquiries />
                </DashboardLayout>
              </RoleRoute>
            } />
            <Route path="/dashboard/wishlist" element={
              <RoleRoute roles={["customer"]}>
                <DashboardLayout>
                  <WishlistPage />
                </DashboardLayout>
              </RoleRoute>
            } />
            <Route path="/dashboard/bookings" element={
              <RoleRoute roles={["customer"]}>
                <DashboardLayout>
                  <BookingsPage />
                </DashboardLayout>
              </RoleRoute>
            } />
            <Route path="/dashboard/orders" element={
              <RoleRoute roles={["customer"]}>
                <DashboardLayout>
                  <OrdersPage />
                </DashboardLayout>
              </RoleRoute>
            } />
            <Route path="/dashboard/notifications" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <NotificationsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/payment-pending" element={
              <RoleRoute roles={["customer"]}>
                <DashboardLayout>
                  <PaymentPending />
                </DashboardLayout>
              </RoleRoute>
            } />
            <Route path="/dashboard/dealer" element={
              <RoleRoute roles={["dealer"]}>
                <DashboardLayout>
                  <DealerDashboard />
                </DashboardLayout>
              </RoleRoute>
            } />
            <Route path="/dashboard/settings" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProfilePage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/dealer/inventory" element={
              <RoleRoute roles={["dealer"]}>
                <DashboardLayout>
                  <ManageInventory />
                </DashboardLayout>
              </RoleRoute>
            } />
            <Route path="/dashboard/dealer/inquiries" element={
              <RoleRoute roles={["dealer"]}>
                <DashboardLayout>
                  <InquiriesReceived />
                </DashboardLayout>
              </RoleRoute>
            } />
            <Route path="/dashboard/dealer/bookings" element={
              <RoleRoute roles={["dealer"]}>
                <DashboardLayout>
                  <BookingRequests />
                </DashboardLayout>
              </RoleRoute>
            } />
            <Route path="/dashboard/dealer/sales" element={
              <RoleRoute roles={["dealer"]}>
                <DashboardLayout>
                  <SalesHistory />
                </DashboardLayout>
              </RoleRoute>
            } />
            <Route path="/dashboard/dealer/orders" element={
              <RoleRoute roles={["dealer"]}>
                <DashboardLayout>
                  <OrdersReceived />
                </DashboardLayout>
              </RoleRoute>
            } />
            <Route path="/dashboard/admin" element={
              <RoleRoute roles={["admin"]}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </RoleRoute>
            } />
            <Route path="/dashboard/admin/users" element={
              <RoleRoute roles={["admin"]}>
                <DashboardLayout>
                  <AdminUsers />
                </DashboardLayout>
              </RoleRoute>
            } />
            <Route path="/dashboard/admin/vehicles" element={
              <RoleRoute roles={["admin"]}>
                <DashboardLayout>
                  <AdminVehicles />
                </DashboardLayout>
              </RoleRoute>
            } />
            <Route path="/dashboard/admin/reports" element={
              <RoleRoute roles={["admin"]}>
                <DashboardLayout>
                  <AdminReports />
                </DashboardLayout>
              </RoleRoute>
            } />
            <Route path="/dashboard/admin/activity" element={
              <RoleRoute roles={["admin"]}>
                <DashboardLayout>
                  <AdminActivity />
                </DashboardLayout>
              </RoleRoute>
            } />
            <Route path="/dashboard/staff" element={
              <RoleRoute roles={["staff"]}>
                <DashboardLayout>
                  <StaffDashboard />
                </DashboardLayout>
              </RoleRoute>
            } />
            <Route path="/dashboard/staff/services" element={
              <RoleRoute roles={["staff"]}>
                <DashboardLayout>
                  <StaffServices />
                </DashboardLayout>
              </RoleRoute>
            } />
            <Route path="/dashboard/staff/inspections" element={
              <RoleRoute roles={["staff"]}>
                <DashboardLayout>
                  <StaffInspections />
                </DashboardLayout>
              </RoleRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
