import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import OrdersPage from "@/pages/OrdersPage";
import VendorDashboard from "@/pages/VendorDashboard";
import ServicesPage from "@/pages/ServicesPage";
import AppointmentsPage from "@/pages/AppointmentsPage";
import ProfilePage from "@/pages/ProfilePage";
import VendorProfilePage from "@/pages/VendorProfilePage";
import SettingsPage from "@/pages/SettingsPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/orders" component={OrdersPage} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/appointments" component={AppointmentsPage} />
      <Route path="/vendor" component={VendorDashboard} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/vendor/profile" component={VendorProfilePage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
