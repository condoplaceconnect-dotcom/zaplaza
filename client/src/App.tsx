import { Switch, Route, Redirect } from "wouter";
import { useAuth } from "./hooks/useAuth";

// Layout Component
import UserLayout from "./components/UserLayout";

// Page Components
import LoginPage from "./pages/LoginPage";
import UserRegistrationPage from "./pages/UserRegistrationPage";
import CondoRegistrationPage from "./pages/CondoRegistrationPage";
import CondoStatusPage from "./pages/CondoStatusPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import HomePage from "./pages/HomePage";
import MarketplaceFeed from "./pages/MarketplaceFeed";
import ServiceFeed from "./pages/ServiceFeed";
import CreatePostPage from "./pages/CreatePostPage";
import ChatListPage from "./pages/ChatListPage";
import ChatPage from "./pages/ChatPage";
import LoanRequestsFeedPage from "./pages/LoanRequestsFeedPage";
import LoanRequestDetailsPage from "./pages/LoanRequestDetailsPage";
import CreateServicePage from "./pages/CreateServicePage";
import LostAndFoundFeed from "./pages/LostAndFoundFeed";
import CreateLostAndFoundPage from "./pages/CreateLostAndFoundPage";
import ProfilePage from "./pages/ProfilePage";

// UI Components
import { Toaster } from "./components/ui/toaster";

// This component wraps all the private routes and applies the UserLayout
const PrivateRoutes = () => {
  return (
    <UserLayout>
      <Switch>
        <Route path="/home" component={HomePage} />
        <Route path="/marketplace" component={MarketplaceFeed} />
        <Route path="/services" component={ServiceFeed} />
        <Route path="/lost-and-found" component={LostAndFoundFeed} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/create-post" component={CreatePostPage} />
        <Route path="/create-service" component={CreateServicePage} />
        <Route path="/create-lost-and-found" component={CreateLostAndFoundPage} />
        <Route path="/loan-requests-feed" component={LoanRequestsFeedPage} />
        <Route path="/loan-requests/:id" component={LoanRequestDetailsPage} />
        <Route path="/chats" component={ChatListPage} />
        <Route path="/chat/:id" component={ChatPage} />
        {/* Redirect from root of private routes to /home */}
        <Route path="/"><Redirect to="/home" /></Route>
        {/* 404 Fallback for private routes */}
        <Route>404, Not Found!</Route>
      </Switch>
    </UserLayout>
  );
};

const App = () => {
  const { token, loading } = useAuth();

  if (loading) {
    // You can replace this with a beautiful spinner component
    return (
      <div className="flex items-center justify-center h-screen">
        Carregando...
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <Switch>
        {/* Public Routes */}
        <Route path="/login">
          {token ? <Redirect to="/home" /> : <LoginPage />}
        </Route>
        <Route path="/register">
          {token ? <Redirect to="/home" /> : <UserRegistrationPage />}
        </Route>

        {/* Special auth routes that don't use the main UserLayout */}
        <Route path="/register-condo">
          {!token ? <Redirect to="/login" /> : <CondoRegistrationPage />}
        </Route>
        <Route path="/condo-status">
          {!token ? <Redirect to="/login" /> : <CondoStatusPage />}
        </Route>
        <Route path="/verify-email">
          {!token ? <Redirect to="/login" /> : <EmailVerificationPage />}
        </Route>

        {/* Catch-all for private routes */}
        <Route path="/:rest*">
          {token ? <PrivateRoutes /> : <Redirect to="/login" />}
        </Route>
      </Switch>
    </>
  );
};

export default App;
