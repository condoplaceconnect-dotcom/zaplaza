import { useState } from "react";
import ServiceCard from "@/components/ServiceCard";
import CategoryChips from "@/components/CategoryChips";
import SearchBar from "@/components/SearchBar";
import CondoSelector from "@/components/CondoSelector";
import CartButton from "@/components/CartButton";
import ThemeToggle from "@/components/ThemeToggle";
import BottomNav from "@/components/BottomNav";
import AppointmentCalendar from "@/components/AppointmentCalendar";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function ServicesPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCondo, setSelectedCondo] = useState<{ id: string; name: string } | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [cartCount] = useState(3);
  const { toast } = useToast();

  const condos: any[] = [];
  const categories: string[] = [];
  const services: any[] = [];
  // Os serviços e profissionais aparecerão aqui quando forem cadastrados

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedServiceData = services.find(s => s.id === selectedService);

  const handleBooking = (date: Date, time: string) => {
    toast({
      title: "Agendamento Confirmado!",
      description: `Seu agendamento com ${selectedServiceData?.name} foi confirmado para ${date.toLocaleDateString('pt-BR')} às ${time}.`,
    });
    setSelectedService(null);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <CondoSelector
            condos={condos}
            selectedCondo={selectedCondo}
            onSelectCondo={setSelectedCondo}
          />
          <SearchBar 
            value={search} 
            onChange={setSearch}
            placeholder="Buscar serviços..."
          />
          <div className="flex gap-2">
            <CartButton itemCount={cartCount} onClick={() => setLocation('/')} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Serviços & Profissionais</h1>
          <p className="text-muted-foreground">
            Encontre prestadores de serviços e profissionais no seu condomínio
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Categorias</h2>
          <CategoryChips
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">
            {selectedCategory ? selectedCategory : 'Todos os Serviços'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map(service => (
              <ServiceCard
                key={service.id}
                {...service}
                onClick={(id) => setSelectedService(id)}
              />
            ))}
          </div>
          {filteredServices.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum serviço encontrado
            </div>
          )}
        </div>
      </main>

      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agendar Serviço</DialogTitle>
          </DialogHeader>
          {selectedServiceData && (
            <AppointmentCalendar
              serviceProviderName={selectedServiceData.name}
              onSelectSlot={handleBooking}
            />
          )}
        </DialogContent>
      </Dialog>

      <BottomNav onNavigate={setLocation} />
    </div>
  );
}
