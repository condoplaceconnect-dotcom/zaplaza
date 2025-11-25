import { Home, ShoppingBag, MessageCircle, User, ArrowRightLeft } from "lucide-react";
import { useLocation, Link } from "wouter";

export default function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { path: '/home', icon: Home, label: 'Home', testId: 'home' },
    { path: '/marketplace', icon: ShoppingBag, label: 'Marketplace', testId: 'marketplace' },
    { path: '/loans', icon: ArrowRightLeft, label: 'Empréstimos', testId: 'loans' },
    { path: '/chat', icon: MessageCircle, label: 'Chat', testId: 'chat' },
    { path: '/profile', icon: User, label: 'Perfil', testId: 'profile' }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
              data-testid={`button-nav-${item.testId}`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
