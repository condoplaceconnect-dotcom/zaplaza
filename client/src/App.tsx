import { Switch, Route, Redirect } from "wouter";
import { useAuth } from "./hooks/useAuth";

// Layout Component
import UserLayout from "./components/UserLayout";

// Page Components
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import UserRegistrationPage from "./pages/UserRegistrationPage";
import CondoRegistrationPage from "./pages/CondoRegistrationPage";
import CondoStatusPage from "./pages/CondoStatusPage";
import VerifyEmailPage from "./pages/VerifyEmailPage"; // Use the new verification page
import CondoSelectionPage from "./pages/CondoSelectionPage"; // Use the new condo selection page
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

const PrivateRoutes = () => (
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
      <Route path="/"><Redirect to="/home" /></Route>
      <Route>404, Not Found!</Route>
    </Switch>
  </UserLayout>
);

const App = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  // Public routes are rendered when there is no token
  if (!token) {
    return (
      <>
        <Toaster />
        <Switch>
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={UserRegistrationPage} />
          <Route path="/select-condo" component={CondoSelectionPage} /> {/* Corrected Route */}
          <Route path="/register-condo" component={CondoRegistrationPage} />
          <Route path="/verify-email" component={VerifyEmailPage} /> {/* Corrected Route */}
          <Route path="/:rest*" component={LandingPage} />
        </Switch>
      </>
    );
  }

  // When there IS a token, render private routes
  return (
    <>
      <Toaster />
      <Switch>
        {/* Routes that don't need the main layout (e.g., status pages) */}
        <Route path="/condo-status" component={CondoStatusPage} />
        
        {/* If user is logged in, redirect public-only pages to home */}
        <Route path="/login"><Redirect to="/home" /></Route>
        <Route path="/register"><Redirect to="/home" /></Route>
        <Route path="/select-condo"><Redirect to="/home" /></Route>
        <Route path="/register-condo"><Redirect to="/home" /></Route>
        <Route path="/verify-email"><Redirect to="/home" /></Route>
        <Route path="/"><Redirect to="/home" /></Route>

        {/* All other authenticated routes use the main layout */}
        <Route path="/:rest*" component={PrivateRoutes} />
      </Switch>
    </> 
  );
};

export default App;
