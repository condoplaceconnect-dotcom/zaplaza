import { lazy, Suspense, useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// ✅ Code Splitting com lazy loading
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
  const [condoStatus, setCondoStatus] = useState<'loading' | 'approved' | 'pending' | 'none'>('loading');

  // Verificar status do condomínio se o usuário está logado e tem um condomínio selecionado
  useEffect(() => {
    if (isLoggedIn && selectedCondoId) {
      const checkCondoStatus = async () => {
        try {
          const response = await fetch(`/api/condominiums/${selectedCondoId}`);
          if (response.ok) {
            const condo = await response.json();
            setCondoStatus(condo.status === 'approved' ? 'approved' : 'pending');
          } else {
            setCondoStatus('none');
          }
        } catch (error) {
          console.error("Erro ao verificar status do condomínio:", error);
          setCondoStatus('none');
        }
      };
      checkCondoStatus();
    } else if (!selectedCondoId) {
      setCondoStatus('none');
    }
  }, [isLoggedIn, selectedCondoId]);

  // Se não está logado, mostra apenas telas de seleção/registro
  if (!isLoggedIn) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={CondoSelectorPage} />
          <Route path="/admin/login" component={AdminLoginPage} />
          <Route path="/register-condo" component={CondoRegistrationPage} />
          <Route path="/register" component={UserRegistrationPage} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    );
  }

  // Se está logado mas sem condomínio selecionado → redireciona para seleção
  if (!selectedCondoId || condoStatus === 'none') {
    return (
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={CondoSelectorPage} />
          <Route path="/admin/login" component={AdminLoginPage} />
          <Route path="/admin/dashboard" component={AdminDashboardPage} />
          <Route path="/register-condo" component={CondoRegistrationPage} />
          <Route path="/register" component={UserRegistrationPage} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    );
  }

  // Se condomínio está pendente → mostra tela de "Aguardando aprovação"
  if (condoStatus === 'pending') {
    return (
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={PendingApprovalPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/admin/login" component={AdminLoginPage} />
          <Route path="/admin/dashboard" component={AdminDashboardPage} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    );
  }

  // Se condomínio está aprovado → mostra todas as rotas normalmente
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
