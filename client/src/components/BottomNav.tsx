import { Home, ShoppingBag, Store, User } from "lucide-react";
import { useLocation } from "wouter";

interface BottomNavProps {
  onNavigate: (path: string) => void;
}

export default function BottomNav({ onNavigate }: BottomNavProps) {
  const [location] = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Início', testId: 'home' },
    { path: '/orders', icon: ShoppingBag, label: 'Pedidos', testId: 'orders' },
    { path: '/vendor', icon: Store, label: 'Vender', testId: 'vendor' },
    { path: '/profile', icon: User, label: 'Perfil', testId: 'profile' }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
              data-testid={`button-nav-${item.testId}`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
