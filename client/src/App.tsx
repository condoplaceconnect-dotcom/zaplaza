import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// ✅ Code Splitting com lazy loading
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const HomePage = lazy(() => import("@/pages/HomePage"));
const OrdersPage = lazy(() => import("@/pages/OrdersPage"));
const VendorDashboard = lazy(() => import("@/pages/VendorDashboard"));
const ServicesPage = lazy(() => import("@/pages/ServicesPage"));
const AppointmentsPage = lazy(() => import("@/pages/AppointmentsPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const VendorProfilePage = lazy(() => import("@/pages/VendorProfilePage"));
const DeliveryProfilePage = lazy(() => import("@/pages/DeliveryProfilePage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const CondoRegistrationPage = lazy(() => import("@/pages/CondoRegistrationPage"));
const UserRegistrationPage = lazy(() => import("@/pages/UserRegistrationPage"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));
const AdminPaymentsPage = lazy(() => import("@/pages/AdminPaymentsPage"));
const CondoSelectorPage = lazy(() => import("@/pages/CondoSelectorPage"));
const StoreProfilePage = lazy(() => import("@/pages/StoreProfilePage"));
const ServiceProviderProfilePage = lazy(() => import("@/pages/ServiceProviderProfilePage"));
const AdminDashboardPage = lazy(() => import("@/pages/AdminDashboardPage"));
const AdminLoginPage = lazy(() => import("@/pages/AdminLoginPage"));
const DeliveryDashboardPage = lazy(() => import("@/pages/DeliveryDashboardPage"));
const PendingApprovalPage = lazy(() => import("@/pages/PendingApprovalPage"));

// Componente de carregamento
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse">
        <div className="h-12 w-12 bg-primary rounded-full"></div>
      </div>
    </div>
  );
}

function Router() {
  const isLoggedIn = !!localStorage.getItem("token");
  const selectedCondoId = localStorage.getItem("selectedCondoId");

  // ❌ NÃO está logado → TELA INICIAL (LandingPage)
  if (!isLoggedIn) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={LandingPage} />
          <Route path="/select-condo" component={CondoSelectorPage} />
          <Route path="/admin/login" component={AdminLoginPage} />
          <Route path="/register-condo" component={CondoRegistrationPage} />
          <Route path="/register" component={UserRegistrationPage} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    );
  }

  // ✅ Está logado MAS NÃO tem condomínio → SELECIONADOR DE CONDOMÍNIO
  if (!selectedCondoId) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={CondoSelectorPage} />
          <Route path="/select-condo" component={CondoSelectorPage} />
          <Route path="/admin/login" component={AdminLoginPage} />
          <Route path="/admin/dashboard" component={AdminDashboardPage} />
          <Route path="/register-condo" component={CondoRegistrationPage} />
          <Route path="/register" component={UserRegistrationPage} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    );
  }

  // ✅ Está logado E tem condomínio → ACESSO COMPLETO
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/orders" component={OrdersPage} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/appointments" component={AppointmentsPage} />
        <Route path="/vendor" component={VendorDashboard} />
        <Route path="/vendor/profile" component={StoreProfilePage} />
        <Route path="/service/profile" component={ServiceProviderProfilePage} />
        <Route path="/admin/dashboard" component={AdminDashboardPage} />
        <Route path="/delivery/dashboard" component={DeliveryDashboardPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/vendor/profile-old" component={VendorProfilePage} />
        <Route path="/delivery/profile" component={DeliveryProfilePage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/register-condo" component={CondoRegistrationPage} />
        <Route path="/register" component={UserRegistrationPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/admin/payments" component={AdminPaymentsPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
