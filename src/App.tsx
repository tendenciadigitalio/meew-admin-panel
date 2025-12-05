import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/auth-context";
import { ProtectedRoute } from "./components/protected-route";
import { AdminLayout } from "./components/layout/admin-layout";
import Dashboard from "./pages/dashboard";
import Products from "./pages/products";
import Categories from "./pages/categories";
import Orders from "./pages/orders";
import Users from "./pages/users";
import Banners from "./pages/banners";
import Coupons from "./pages/coupons";
import PopUps from "./pages/popups";
import AppMods from "./pages/app-mods";
import Shipments from "./pages/shipments";
import Notifications from "./pages/notifications";
import Reviews from "./pages/reviews";
import PopularSearches from "./pages/popular-searches";
import Auth from "./pages/auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/popular-searches" element={<PopularSearches />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/users" element={<Users />} />
              <Route path="/banners" element={<Banners />} />
              <Route path="/coupons" element={<Coupons />} />
              <Route path="/popups" element={<PopUps />} />
              <Route path="/app-mods" element={<AppMods />} />
              <Route path="/shipments" element={<Shipments />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
