import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";

// Layouts
import AdminLayout from "@/pages/admin/AdminLayout";

// Pages
import NotFound from "@/pages/not-found";
import CreateReportPage from "@/pages/CreateReportPage";

// Lazy-loaded Pages
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const HomePage = lazy(() => import("@/pages/HomePage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const EmailVerificationPage = lazy(() => import("@/pages/EmailVerificationPage"));
const OrdersPage = lazy(() => import("@/pages/OrdersPage"));
const VendorDashboard = lazy(() => import("@/pages/VendorDashboard"));
const ServicesPage = lazy(() => import("@/pages/ServicesPage"));
const AppointmentsPage = lazy(() => import("@/pages/AppointmentsPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const CondoRegistrationPage = lazy(() => import("@/pages/CondoRegistrationPage"));
const UserRegistrationPage = lazy(() => import("@/pages/UserRegistrationPage"));
const CondoSelectorPage = lazy(() => import("@/pages/CondoSelectorPage"));
const FamilyAccountPage = lazy(() => import("@/pages/FamilyAccountPage"));
const MarketplacePage = lazy(() => import("@/pages/MarketplacePage"));

// Admin Pages (Lazy-loaded)
const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage"));
const AdminLoginPage = lazy(() => import("@/pages/admin/AdminLoginPage"));
const CondoApprovalPage = lazy(() => import("@/pages/admin/CondoApprovalPage"));
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage"));
const ReportsPage = lazy(() => import("@/pages/admin/ReportsPage"));
const ReportDetailsPage = lazy(() => import("@/pages/admin/ReportDetailsPage"));

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
  // Admin Routes Component
  const AdminRoutes = () => (
    <AdminLayout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/admin/dashboard" component={AdminDashboardPage} />
          <Route path="/admin/condo-approval" component={CondoApprovalPage} />
          <Route path="/admin/users" component={AdminUsersPage} />
          <Route path="/admin/reports" component={ReportsPage} />
          <Route path="/admin/reports/:id" component={ReportDetailsPage} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </AdminLayout>
  );

  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Public & Auth Routes */}
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={UserRegistrationPage} />
        <Route path="/register-condo" component={CondoRegistrationPage} />
        <Route path="/verify-email" component={EmailVerificationPage} />
        <Route path="/select-condo" component={CondoSelectorPage} />
        
        {/* Authenticated User Routes */}
        <Route path="/home" component={HomePage} />
        <Route path="/orders" component={OrdersPage} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/appointments" component={AppointmentsPage} />
        <Route path="/marketplace" component={MarketplacePage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/family" component={FamilyAccountPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/report/create" component={CreateReportPage} />

        {/* Role-Specific Dashboards */}
        <Route path="/vendor/dashboard" component={VendorDashboard} />

        {/* Admin Routes */}
        <Route path="/admin/login" component={AdminLoginPage} />
        <Route path="/admin/:rest*" component={AdminRoutes} />
        
        {/* Not Found */}
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
