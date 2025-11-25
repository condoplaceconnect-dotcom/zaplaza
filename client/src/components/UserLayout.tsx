import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { BottomNav } from "./BottomNav";
import CreatePostFAB from "./CreatePostFAB";
import { Loader2 } from 'lucide-react';
import { EmailVerificationBanner } from './EmailVerificationBanner';

interface UserLayoutProps {
  children: React.ReactNode;
}

function FullPageLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function UserLayout({ children }: UserLayoutProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    if (!user.condoId) {
      setLocation('/register-condo');
    } else if (user.condoStatus === 'pending') {
      setLocation('/condo-status');
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!user || !user.condoId || user.condoStatus === 'pending') {
    return <FullPageLoader />;
  }

  return (
    <div className="pb-20">
      {user.isEmailVerified === false && (
        <EmailVerificationBanner emailVerified={user.isEmailVerified} />
      )}
      <main className="p-4">{children}</main>
      <CreatePostFAB />
      <BottomNav />
    </div>
  );
}
