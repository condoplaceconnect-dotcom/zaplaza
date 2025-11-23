import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, MapPin, Star, LogOut, AlertCircle } from "lucide-react";

export default function DeliveryDashboardPage() {
  const [, setLocation] = useLocation();
  const [isOnline, setIsOnline] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Dashboard Entregador</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant={isOnline ? "default" : "outline"}
              onClick={() => setIsOnline(!isOnline)}
              data-testid="button-toggle-online"
            >
              {isOnline ? "🟢 Online" : "🔴 Offline"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!isOnline && (
          <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">Você está offline. Clique em "Online" para receber pedidos.</p>
            </div>
          </Card>
        )}

        <Tabs defaultValue="deliveries" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="deliveries" data-testid="tab-deliveries">
              <Package className="w-4 h-4 mr-2" />
              Entregas
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              Histórico
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">
              Perfil
            </TabsTrigger>
          </TabsList>

          {/* DELIVERIES */}
          <TabsContent value="deliveries" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground">Entregas Hoje</h3>
                <p className="text-3xl font-bold mt-2">0</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground">Ganhos Hoje</h3>
                <p className="text-3xl font-bold mt-2">R$ 0,00</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground">Avaliação</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-2xl font-bold">5.0</span>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Pedidos Disponíveis</h2>
              <p className="text-muted-foreground">Nenhum pedido disponível no momento. Fique online para receber.</p>
            </Card>
          </TabsContent>

          {/* HISTORY */}
          <TabsContent value="history" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Histórico de Entregas</h2>
              <p className="text-muted-foreground">Você ainda não fez nenhuma entrega.</p>
            </Card>
          </TabsContent>

          {/* PROFILE */}
          <TabsContent value="profile" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Seu Perfil</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome</label>
                  <p className="text-lg mt-1">Seu Nome</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Bloco</label>
                  <p className="text-lg mt-1">Bloco A</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Telefone</label>
                  <p className="text-lg mt-1">(11) 98765-4321</p>
                </div>
                <Button variant="outline" className="w-full mt-4" data-testid="button-edit-profile">
                  Editar Perfil
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
