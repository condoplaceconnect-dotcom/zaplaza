import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BarChart3, Users, Home, Store, LogOut, Check, X, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface User {
  id: string;
  username: string;
  role: string;
  condoId?: string;
  createdAt?: string;
}

interface Store {
  id: string;
  name: string;
  category: string;
  userId: string;
  status: string;
}

export default function AdminDashboardPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ title: "", content: "" });

  const { data: pendingCondos = [] } = useQuery<Condominium[]>({
    queryKey: ["/api/condominiums/pending/list"],
  });

  const approveMutation = useMutation({
    mutationFn: async (condoId: string) => {
      const response = await fetch(`/api/condominiums/${condoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      if (!response.ok) throw new Error("Erro ao aprovar");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Condomínio aprovado" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (condoId: string) => {
      const response = await fetch(`/api/condominiums/${condoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
      if (!response.ok) throw new Error("Erro ao rejeitar");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Condomínio rejeitado" });
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Home className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">CondoPlace - Admin</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="requests" data-testid="tab-requests">
              Solicitações
            </TabsTrigger>
            <TabsTrigger value="condo" data-testid="tab-condo">
              <Home className="w-4 h-4 mr-2" />
              Condomínio
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
              <h2 className="text-lg font-semibold">Solicitações Pendentes</h2>
              <Badge variant="secondary">{pendingCondos.length} condomínios</Badge>
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
                        </div>
                      </div>
                      <Badge variant="outline">Pendente</Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
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

          {/* CONDOMINIUM */}
          <TabsContent value="condo" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-6">Dados do Condomínio</h2>
              <div className="space-y-4">
                <div>
                  <Label>Nome do Condomínio</Label>
                  <Input placeholder="Ex: Condominio Acqua Sena" data-testid="input-condo-name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cidade</Label>
                    <Input placeholder="São Paulo" data-testid="input-city" />
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <Input placeholder="SP" maxLength={2} data-testid="input-state" />
                  </div>
                </div>
                <div>
                  <Label>Endereço</Label>
                  <Input placeholder="Rua das Flores, 100" data-testid="input-address" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Unidades</Label>
                    <Input type="number" placeholder="120" data-testid="input-units" />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <Input placeholder="(11) 1234-5678" data-testid="input-phone" />
                  </div>
                </div>
                <Button className="w-full" data-testid="button-save-condo">Salvar Alterações</Button>
              </div>
            </Card>
          </TabsContent>

          {/* RESIDENTS */}
          <TabsContent value="residents" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Gerenciar Moradores</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Username</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-2">morador1</td>
                      <td className="p-2">morador@example.com</td>
                      <td className="p-2">
                        <Button size="sm" variant="outline" data-testid="button-edit-resident">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" data-testid="button-delete-resident">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* STORES */}
          <TabsContent value="stores" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Gerenciar Lojas</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Nome</th>
                      <th className="text-left p-2">Categoria</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-2">Padaria do João</td>
                      <td className="p-2">Alimentos</td>
                      <td className="p-2">
                        <Badge variant="default">Ativo</Badge>
                      </td>
                      <td className="p-2">
                        <Button size="sm" variant="outline" data-testid="button-edit-store">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" data-testid="button-delete-store">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* COMMUNICATIONS */}
          <TabsContent value="communications" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-6">Criar Comunicado</h2>
              <div className="space-y-4">
                <div>
                  <Label>Título</Label>
                  <Input
                    placeholder="Título do comunicado"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    data-testid="input-communication-title"
                  />
                </div>
                <div>
                  <Label>Conteúdo</Label>
                  <Textarea
                    placeholder="Mensagem para os moradores..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    data-testid="input-communication-content"
                  />
                </div>
                <Button className="w-full" data-testid="button-publish-communication">
                  Publicar Comunicado
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Comunicados Publicados</h2>
              <div className="space-y-3">
                <Card className="p-4 bg-muted/50">
                  <p className="font-semibold">Manutenção agendada</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Será realizada manutenção na caixa d'água no próximo sábado
                  </p>
                </Card>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
