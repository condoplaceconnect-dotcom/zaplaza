import { useState } from "react";
import VendorOrderCard from "@/components/VendorOrderCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "@/components/ThemeToggle";
import BottomNav from "@/components/BottomNav";
import { useLocation } from "wouter";
import { ArrowLeft, Plus, Store, User } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";

type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivered';

interface VendorOrder {
  id: string;
  customerName: string;
  unit: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  status: OrderStatus;
  date: Date;
}

export default function VendorDashboard() {
  const [, setLocation] = useLocation();
  const [storeOpen, setStoreOpen] = useState(true);
  const [orders, setOrders] = useState<VendorOrder[]>([
    {
      id: '1',
      customerName: 'João Silva',
      unit: '301',
      items: [
        { name: 'Brigadeiro Gourmet', quantity: 6, price: 3.50 },
        { name: 'Brownie', quantity: 2, price: 8.00 }
      ],
      total: 37.00,
      status: 'pending',
      date: new Date(Date.now() - 5 * 60000)
    },
    {
      id: '2',
      customerName: 'Maria Santos',
      unit: '102',
      items: [
        { name: 'Cookies Caseiros', quantity: 1, price: 12.00 }
      ],
      total: 12.00,
      status: 'preparing',
      date: new Date(Date.now() - 20 * 60000)
    },
    {
      id: '3',
      customerName: 'Carlos Oliveira',
      unit: '205',
      items: [
        { name: 'Brigadeiro Gourmet', quantity: 12, price: 3.50 }
      ],
      total: 42.00,
      status: 'ready',
      date: new Date(Date.now() - 35 * 60000)
    }
  ]);

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const activeOrders = orders.filter(o => ['accepted', 'preparing', 'ready'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'delivered');

  const acceptOrder = (id: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'accepted' as OrderStatus } : o));
  };

  const rejectOrder = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
  };

  const updateStatus = (id: string, status: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: status as OrderStatus } : o));
  };

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
            <Store className="w-5 h-5" />
            <h1 className="text-xl font-bold">Painel do Vendedor</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/vendor/profile')}
              data-testid="button-vendor-profile"
            >
              <User className="w-5 h-5" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-1">Doces da Maria</h2>
              <p className="text-sm text-muted-foreground">Sobremesas artesanais</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Status da loja</p>
                <Badge variant={storeOpen ? "default" : "secondary"}>
                  {storeOpen ? 'Aberta' : 'Fechada'}
                </Badge>
              </div>
              <Switch
                checked={storeOpen}
                onCheckedChange={setStoreOpen}
                data-testid="switch-store-status"
              />
            </div>
          </div>
        </Card>

        {pendingOrders.length > 0 && (
          <Card className="p-4 bg-accent/10 border-accent">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">{pendingOrders.length}</Badge>
              <span className="font-semibold">Novos pedidos aguardando</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Você tem {pendingOrders.length} pedido(s) aguardando sua resposta
            </p>
          </Card>
        )}

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Pedidos</h2>
          <Button onClick={() => console.log('Add product')} data-testid="button-add-product">
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="pending" data-testid="tab-pending">
              Novos ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="active" data-testid="tab-active">
              Em Preparo ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed">
              Concluídos ({completedOrders.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="space-y-4">
            {pendingOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum pedido novo no momento
              </div>
            ) : (
              pendingOrders.map(order => (
                <VendorOrderCard
                  key={order.id}
                  {...order}
                  onAccept={acceptOrder}
                  onReject={rejectOrder}
                />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="active" className="space-y-4">
            {activeOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum pedido em preparo
              </div>
            ) : (
              activeOrders.map(order => (
                <VendorOrderCard
                  key={order.id}
                  {...order}
                  onUpdateStatus={updateStatus}
                />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            {completedOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum pedido concluído ainda
              </div>
            ) : (
              completedOrders.map(order => (
                <VendorOrderCard
                  key={order.id}
                  {...order}
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
