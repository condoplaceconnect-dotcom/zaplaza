import { Home, ShoppingBag, MessageSquare, User, ArrowRightLeft, Search, Briefcase } from "lucide-react";
import { useLocation, Link } from "wouter";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { path: '/home', icon: Home, label: 'Home', testId: 'home' },
    { path: '/marketplace', icon: ShoppingBag, label: 'Achadinhos', testId: 'marketplace' },
    { path: '/services', icon: Briefcase, label: 'Zap Bico', testId: 'services' },
    { path: '/lost-and-found', icon: Search, label: 'Achados', testId: 'lost-and-found' },
    { path: '/chats', icon: MessageSquare, label: 'Conversas', testId: 'chats' },
    { path: '/profile', icon: User, label: 'Perfil', testId: 'profile' }, // Re-adding the profile link
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.startsWith(item.path) && (location === item.path || location.startsWith(`${item.path}/`));
          const isHomeActive = item.path === '/home' && location === '/home';

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                (item.path === '/home' ? isHomeActive : isActive) ? 'text-primary' : 'text-muted-foreground'
              }`}
              data-testid={`button-nav-${item.testId}`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs text-center">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
