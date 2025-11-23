import { useState } from "react";
import OrderCard from "@/components/OrderCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CartButton from "@/components/CartButton";
import ThemeToggle from "@/components/ThemeToggle";
import BottomNav from "@/components/BottomNav";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrdersPage() {
  const [, setLocation] = useLocation();
  const [cartCount] = useState(3);

  const orders: any[] = [];
  // Os pedidos aparecerão aqui quando você começar a fazer compras

  const activeOrders = orders.filter(o => ['pending', 'accepted', 'preparing', 'ready'].includes(o.status));
  const pastOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/')}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Meus Pedidos</h1>
          </div>
          <div className="flex gap-2">
            <CartButton itemCount={cartCount} onClick={() => console.log('Cart')} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="active" data-testid="tab-active">
              Ativos ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="past" data-testid="tab-past">
              Histórico ({pastOrders.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            {activeOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Você não tem pedidos ativos
              </div>
            ) : (
              activeOrders.map(order => (
                <OrderCard
                  key={order.id}
                  {...order}
                  onViewDetails={(id) => console.log('View order:', id)}
                />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="past" className="space-y-4">
            {pastOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Você ainda não tem pedidos concluídos
              </div>
            ) : (
              pastOrders.map(order => (
                <OrderCard
                  key={order.id}
                  {...order}
                  onViewDetails={(id) => console.log('View order:', id)}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav onNavigate={setLocation} />
    </div>
  );
}
