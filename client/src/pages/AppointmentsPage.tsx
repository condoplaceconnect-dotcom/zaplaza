import { useState } from "react";
import AppointmentCard from "@/components/AppointmentCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CartButton from "@/components/CartButton";
import ThemeToggle from "@/components/ThemeToggle";
import BottomNav from "@/components/BottomNav";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled';

interface Appointment {
  id: string;
  serviceProviderName: string;
  serviceType: string;
  date: Date;
  time: string;
  location: string;
  status: AppointmentStatus;
}

export default function AppointmentsPage() {
  const [, setLocation] = useLocation();
  const [cartCount] = useState(3);
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      serviceProviderName: 'Studio da Ana',
      serviceType: 'Corte de Cabelo',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      time: '14:00',
      location: 'Apto 405',
      status: 'scheduled'
    },
    {
      id: '2',
      serviceProviderName: 'Eletricista Carlos',
      serviceType: 'Reparo Elétrico',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      time: '10:00',
      location: 'Apto 301',
      status: 'confirmed'
    },
    {
      id: '3',
      serviceProviderName: 'Barbearia do João',
      serviceType: 'Barba e Cabelo',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      time: '16:00',
      location: 'Apto 405',
      status: 'completed'
    }
  ]);

  const upcomingAppointments = appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status));
  const pastAppointments = appointments.filter(a => ['completed', 'cancelled'].includes(a.status));

  const handleCancel = (id: string) => {
    setAppointments(appointments.map(a => 
      a.id === id ? { ...a, status: 'cancelled' as AppointmentStatus } : a
    ));
    toast({
      title: "Agendamento Cancelado",
      description: "Seu agendamento foi cancelado com sucesso.",
      variant: "destructive"
    });
  };

  const handleReschedule = (id: string) => {
    toast({
      title: "Reagendar",
      description: "Funcionalidade de reagendamento em desenvolvimento.",
    });
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
            <h1 className="text-xl font-bold">Meus Agendamentos</h1>
          </div>
          <div className="flex gap-2">
            <CartButton itemCount={cartCount} onClick={() => setLocation('/')} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upcoming" data-testid="tab-upcoming">
              Próximos ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past" data-testid="tab-past">
              Histórico ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Você não tem agendamentos próximos
              </div>
            ) : (
              upcomingAppointments.map(appointment => (
                <AppointmentCard
                  key={appointment.id}
                  {...appointment}
                  onCancel={handleCancel}
                  onReschedule={handleReschedule}
                />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="past" className="space-y-4">
            {pastAppointments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Você ainda não tem agendamentos concluídos
              </div>
            ) : (
              pastAppointments.map(appointment => (
                <AppointmentCard
                  key={appointment.id}
                  {...appointment}
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
