import { useState } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import StatsCard from "@/components/StatsCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThemeToggle from "@/components/ThemeToggle";
import BottomNav from "@/components/BottomNav";
import { useLocation } from "wouter";
import { ArrowLeft, TrendingUp, Star, Truck, DollarSign, MapPin, Clock, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function DeliveryProfilePage() {
  const [, setLocation] = useLocation();
  const [deliveryStatus, setDeliveryStatus] = useState<'available' | 'on-delivery' | 'offline'>('available');

  const deliveries = [
    {
      id: '1',
      customerName: 'João Silva',
      unit: '301',
      items: 3,
      distance: '0.5 km',
      earnings: 'R$ 12.00',
      status: 'completed' as const,
      date: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    {
      id: '2',
      customerName: 'Maria Santos',
      unit: '405',
      items: 2,
      distance: '0.8 km',
      earnings: 'R$ 15.00',
      status: 'completed' as const,
      date: new Date(Date.now() - 3 * 60 * 60 * 1000)
    },
    {
      id: '3',
      customerName: 'Carlos Oliveira',
      unit: '205',
      items: 5,
      distance: '1.2 km',
      earnings: 'R$ 18.00',
      status: 'completed' as const,
      date: new Date(Date.now() - 5 * 60 * 60 * 1000)
    }
  ];

  const statusConfig = {
    'available': { label: 'Disponível', color: 'bg-green-100 text-green-800' },
    'on-delivery': { label: 'Em Entrega', color: 'bg-blue-100 text-blue-800' },
    'offline': { label: 'Offline', color: 'bg-gray-100 text-gray-800' }
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
            <Truck className="w-5 h-5" />
            <h1 className="text-xl font-bold">Perfil do Entregador</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/settings')}
              data-testid="button-settings"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <ProfileHeader
          name="Pedro Rocha"
          unit="102"
          onEdit={() => console.log('Edit profile')}
        />

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg mb-1">Status de Disponibilidade</h3>
              <p className="text-sm text-muted-foreground">
                Defina seu status para receber solicitações de entrega
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={deliveryStatus === 'available' ? 'default' : 'outline'}
                onClick={() => setDeliveryStatus('available')}
                data-testid="button-status-available"
              >
                Disponível
              </Button>
              <Button
                variant={deliveryStatus === 'on-delivery' ? 'default' : 'outline'}
                onClick={() => setDeliveryStatus('on-delivery')}
                data-testid="button-status-on-delivery"
              >
                Em Entrega
              </Button>
              <Button
                variant={deliveryStatus === 'offline' ? 'default' : 'outline'}
                onClick={() => setDeliveryStatus('offline')}
                data-testid="button-status-offline"
              >
                Offline
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${statusConfig[deliveryStatus].color.split(' ')[0]}`} />
            <Badge className={statusConfig[deliveryStatus].color} data-testid="badge-delivery-status">
              {statusConfig[deliveryStatus].label}
            </Badge>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard icon={Truck} label="Entregas Hoje" value={8} iconColor="text-primary" />
          <StatsCard icon={DollarSign} label="Ganhos do Dia" value="R$ 180" iconColor="text-green-600" />
          <StatsCard icon={Star} label="Avaliação" value="4.9" iconColor="text-accent" />
        </div>

        <Tabs defaultValue="deliveries" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deliveries" data-testid="tab-deliveries">
              Histórico de Entregas
            </TabsTrigger>
            <TabsTrigger value="earnings" data-testid="tab-earnings">
              Ganhos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deliveries" className="space-y-4 mt-6">
            {deliveries.map(delivery => (
              <Card key={delivery.id} className="p-4" data-testid={`card-delivery-${delivery.id}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold" data-testid={`text-customer-${delivery.id}`}>
                      {delivery.customerName}
                    </h3>
                    <p className="text-sm text-muted-foreground">Unidade {delivery.unit}</p>
                  </div>
                  <Badge variant="secondary">Concluído</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="flex items-center gap-1 text-sm">
                    <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                    <span>{delivery.items} itens</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{delivery.distance}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{delivery.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-sm font-semibold text-green-600" data-testid={`text-earnings-${delivery.id}`}>
                    {delivery.earnings}
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" data-testid={`button-view-delivery-${delivery.id}`}>
                    Ver Detalhes
                  </Button>
                  <Button variant="ghost" className="flex-1" data-testid={`button-rate-delivery-${delivery.id}`}>
                    <Star className="w-4 h-4 mr-2" />
                    Avaliação
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="earnings" className="space-y-4 mt-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Ganhos de Hoje</p>
                  <p className="text-3xl font-bold text-green-600" data-testid="text-earnings-today">
                    R$ 180,00
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Ganhos da Semana</p>
                  <p className="text-2xl font-bold" data-testid="text-earnings-week">
                    R$ 1.260,00
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Ganhos do Mês</p>
                  <p className="text-2xl font-bold" data-testid="text-earnings-month">
                    R$ 5.400,00
                  </p>
                </div>

                <Separator />

                <div className="bg-secondary p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Saldo Disponível para Saque</p>
                  <p className="text-2xl font-bold text-primary" data-testid="text-available-balance">
                    R$ 2.150,00
                  </p>
                  <Button className="w-full mt-4" data-testid="button-withdraw">
                    Solicitar Saque
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav onNavigate={setLocation} />
    </div>
  );
}

// Helper component for ShoppingBag icon that's imported
import { ShoppingBag } from "lucide-react";
