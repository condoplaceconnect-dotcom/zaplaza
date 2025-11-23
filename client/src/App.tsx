import { lazy, Suspense, useEffect, useState } from "react";
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
const FamilyAccountPage = lazy(() => import("@/pages/FamilyAccountPage"));

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

// Reset page para limpar localStorage
function ResetPage() {
  localStorage.clear();
  window.location.href = "/";
  return <PageLoader />;
}

function Router() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Começa false, só true após validar
  const [selectedCondoId, setSelectedCondoId] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState("pending");

  // Validar auth state via /api/auth/me no boot
  useEffect(() => {
    const validateAuth = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        // Sem token, garantir tudo limpo
        setIsLoggedIn(false);
        setSelectedCondoId(null);
        setUserStatus("pending");
        setAuthChecked(true);
        return;
      }

      try {
        // Buscar dados frescos do backend
        const response = await fetch("/api/auth/me", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          // Token inválido ou expirado - limpar tudo
          localStorage.clear();
          setIsLoggedIn(false);
          setSelectedCondoId(null);
          setUserStatus("pending");
          setAuthChecked(true);
          return;
        }

        const { user } = await response.json();
        
        // Atualizar localStorage com dados frescos
        localStorage.setItem("user", JSON.stringify({
          id: user.id,
          username: user.username,
          role: user.role,
          status: user.status || "pending"
        }));

        // Atualizar estado
        setUserStatus(user.status || "pending");
        setIsLoggedIn(true);
        
        // Se usuário não está aprovado, NÃO salvar selectedCondoId
        if (user.status !== "approved") {
          localStorage.removeItem("selectedCondoId");
          setSelectedCondoId(null);
        } else if (user.condoId) {
          // Se usuário está aprovado E tem condoId, atualizar
          localStorage.setItem("selectedCondoId", user.condoId);
          setSelectedCondoId(user.condoId);
        }
        
      } catch (error) {
        console.error("Erro ao validar auth:", error);
        // Em caso de ERRO (rede, parsing, etc), limpar tudo como token inválido
        localStorage.clear();
        setIsLoggedIn(false);
        setSelectedCondoId(null);
        setUserStatus("pending");
      } finally {
        setAuthChecked(true);
      }
    };

    validateAuth();
  }, []);

  // 🔍 DEBUG
  console.log("🔍 Router State:", { isLoggedIn, selectedCondoId, userStatus, authChecked });

  // Aguardar validação antes de renderizar
  if (!authChecked) {
    return <PageLoader />;
  }

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

  // ⏳ Está logado MAS status pending → AGUARDANDO APROVAÇÃO (BLOQUEIA TODAS AS ROTAS!)
  if (userStatus === "pending") {
    return (
      <Suspense fallback={<PageLoader />}>
        <PendingApprovalPage />
      </Suspense>
    );
  }

  // ✅ Está logado, aprovado MAS NÃO tem condomínio → SELECIONADOR DE CONDOMÍNIO
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

  // ✅ Está logado, tem condomínio E está aprovado → ACESSO COMPLETO
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/reset" component={ResetPage} />
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
        <Route path="/family" component={FamilyAccountPage} />
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
