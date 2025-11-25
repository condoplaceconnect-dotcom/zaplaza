import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Layouts
import AdminLayout from "@/pages/admin/AdminLayout";
import UserLayout from "@/components/UserLayout";

// Pages
import NotFound from "@/pages/not-found";
import CreateReportPage from "@/pages/CreateReportPage";
const CondoStatusPage = lazy(() => import("@/pages/CondoStatusPage"));

// Lazy-loaded Pages
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const HomePage = lazy(() => import("@/pages/HomePage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const EmailVerificationPage = lazy(() => import("@/pages/EmailVerificationPage"));
const OrdersPage = lazy(() => import("@/pages/OrdersPage"));
const ChatPage = lazy(() => import("@/pages/ChatPage"));
const VendorDashboard = lazy(() => import("@/pages/VendorDashboard"));
const ServicesPage = lazy(() => import("@/pages/ServicesPage"));
const AppointmentsPage = lazy(() => import("@/pages/AppointmentsPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const CondoRegistrationPage = lazy(() => import("@/pages/CondoRegistrationPage"));
const UserRegistrationPage = lazy(() => import("@/pages/UserRegistrationPage"));
const FamilyAccountPage = lazy(() => import("@/pages/FamilyAccountPage"));
const MarketplacePage = lazy(() => import("@/pages/MarketplacePage"));
const CreatePostPage = lazy(() => import("@/pages/CreatePostPage"));
const LoansPage = lazy(() => import("@/pages/LoansPage")); // Import the new LoansPage

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

  const AuthenticatedUserRoutes = () => (
    <UserLayout>
      <Switch>
        <Route path="/home" component={HomePage} />
        <Route path="/orders" component={OrdersPage} />
        <Route path="/chat" component={ChatPage} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/appointments" component={AppointmentsPage} />
        <Route path="/marketplace" component={MarketplacePage} />
        <Route path="/loans" component={LoansPage} /> {/* Add the new route */}
        <Route path="/profile" component={ProfilePage} />
        <Route path="/family" component={FamilyAccountPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/report/create" component={CreateReportPage} />
        <Route path="/vendor/dashboard" component={VendorDashboard} />
        <Route path="/posts/create" component={CreatePostPage} />
        <Route component={NotFound} />
      </Switch>
    </UserLayout>
  )

  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Public & Auth Routes */}
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={UserRegistrationPage} />
        <Route path="/register-condo" component={CondoRegistrationPage} />
        <Route path="/verify-email" component={EmailVerificationPage} />
        <Route path="/condo-status" component={CondoStatusPage} />
        
        {/* Authenticated User Routes */}
        <ProtectedRoute>
          <AuthenticatedUserRoutes />
        </ProtectedRoute>

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
