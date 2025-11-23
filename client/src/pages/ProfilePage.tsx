import { useState } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import StatsCard from "@/components/StatsCard";
import OrderCard from "@/components/OrderCard";
import AppointmentCard from "@/components/AppointmentCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThemeToggle from "@/components/ThemeToggle";
import BottomNav from "@/components/BottomNav";
import { useLocation } from "wouter";
import { ArrowLeft, ShoppingBag, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const [, setLocation] = useLocation();

  const recentOrders = [
    {
      id: '1',
      storeName: 'Doces da Maria',
      items: [
        { name: 'Brigadeiro Gourmet', quantity: 6 },
        { name: 'Brownie', quantity: 2 }
      ],
      total: 35.00,
      status: 'delivered' as const,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      storeName: 'Salgados da Dona Ana',
      items: [
        { name: 'Coxinha', quantity: 4 }
      ],
      total: 18.00,
      status: 'delivered' as const,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ];

  const recentAppointments = [
    {
      id: '1',
      serviceProviderName: 'Studio da Ana',
      serviceType: 'Corte de Cabelo',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      time: '14:00',
      location: 'Apto 405',
      status: 'scheduled' as const
    }
  ];

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
            <h1 className="text-xl font-bold">Meu Perfil</h1>
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
          name="João Silva"
          unit="301"
          onEdit={() => console.log('Edit profile')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatsCard icon={ShoppingBag} label="Total de Pedidos" value={42} />
          <StatsCard icon={Calendar} label="Agendamentos Realizados" value={15} />
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders" data-testid="tab-orders">
              Pedidos Recentes
            </TabsTrigger>
            <TabsTrigger value="appointments" data-testid="tab-appointments">
              Agendamentos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders" className="space-y-4 mt-6">
            {recentOrders.map(order => (
              <OrderCard
                key={order.id}
                {...order}
                onViewDetails={(id) => console.log('View order:', id)}
              />
            ))}
          </TabsContent>
          
          <TabsContent value="appointments" className="space-y-4 mt-6">
            {recentAppointments.map(appointment => (
              <AppointmentCard
                key={appointment.id}
                {...appointment}
                onCancel={(id) => console.log('Cancel:', id)}
                onReschedule={(id) => console.log('Reschedule:', id)}
              />
            ))}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav onNavigate={setLocation} />
    </div>
  );
}
