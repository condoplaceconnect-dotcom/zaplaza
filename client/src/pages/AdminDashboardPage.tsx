import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, Home, Store, LogOut, Check, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Condominium {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  units: number;
  phone?: string;
  email?: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
}

export default function AdminDashboardPage() {
  const [, setLocation] = useLocation();

  const { data: pendingCondos = [] } = useQuery<Condominium[]>({
    queryKey: ["/api/condominiums/pending/list"],
  });

  const approveMutation = useMutation({
    mutationFn: (condoId: string) => 
      apiRequest(`/api/condominiums/${condoId}`, { method: "PATCH", body: { status: "approved" } }),
  });

  const rejectMutation = useMutation({
    mutationFn: (condoId: string) => 
      apiRequest(`/api/condominiums/${condoId}`, { method: "PATCH", body: { status: "rejected" } }),
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Home className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="requests" data-testid="tab-requests">
              <Home className="w-4 h-4 mr-2" />
              Solicitações
            </TabsTrigger>
            <TabsTrigger value="residents" data-testid="tab-residents">
              <Users className="w-4 h-4 mr-2" />
              Moradores
            </TabsTrigger>
            <TabsTrigger value="stores" data-testid="tab-stores">
              <Store className="w-4 h-4 mr-2" />
              Lojas
            </TabsTrigger>
            <TabsTrigger value="communications" data-testid="tab-comms">
              Comunicados
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground">Moradores</h3>
                <p className="text-3xl font-bold mt-2">145</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground">Lojas Ativas</h3>
                <p className="text-3xl font-bold mt-2">12</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground">Serviços</h3>
                <p className="text-3xl font-bold mt-2">8</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground">Pedidos Hoje</h3>
                <p className="text-3xl font-bold mt-2">24</p>
              </Card>
            </div>
          </TabsContent>

          {/* REQUESTS */}
          <TabsContent value="requests" className="space-y-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Solicitações de Registro de Condomínio</h2>
              <Badge variant="secondary">{pendingCondos.length} pendentes</Badge>
            </div>

            {pendingCondos.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Nenhuma solicitação pendente</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingCondos.map((condo) => (
                  <Card key={condo.id} className="p-6" data-testid={`card-condo-request-${condo.id}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{condo.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {condo.address}, {condo.city} - {condo.state}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{condo.units} unidades</span>
                          {condo.phone && <span>Tel: {condo.phone}</span>}
                          {condo.email && <span>Email: {condo.email}</span>}
                        </div>
                      </div>
                      <Badge variant="outline">Pendente</Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => approveMutation.mutate(condo.id)}
                        disabled={approveMutation.isPending}
                        data-testid={`button-approve-${condo.id}`}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectMutation.mutate(condo.id)}
                        disabled={rejectMutation.isPending}
                        data-testid={`button-reject-${condo.id}`}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* RESIDENTS */}
          <TabsContent value="residents" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Gerenciar Moradores</h2>
              <p className="text-muted-foreground">Funcionalidade de gerenciamento de moradores em desenvolvimento</p>
            </Card>
          </TabsContent>

          {/* STORES */}
          <TabsContent value="stores" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Gerenciar Lojas</h2>
              <p className="text-muted-foreground">Funcionalidade de gerenciamento de lojas em desenvolvimento</p>
            </Card>
          </TabsContent>

          {/* COMMUNICATIONS */}
          <TabsContent value="communications" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Comunicados</h2>
              <p className="text-muted-foreground">Funcionalidade de comunicados em desenvolvimento</p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
