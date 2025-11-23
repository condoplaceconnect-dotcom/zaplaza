import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Plus, Trash2, Edit2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration?: number;
  image?: string;
  available: boolean;
}

interface ServiceProvider {
  id: string;
  name: string;
  description: string;
  serviceType: string;
  image?: string;
  phone: string;
  email: string;
}

export default function ServiceProviderProfilePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newService, setNewService] = useState<Partial<Service>>({
    name: "",
    description: "",
    price: 0,
    duration: 60,
    available: true,
  });

  useEffect(() => {
    setProvider({
      id: "1",
      name: "Meu Serviço",
      description: "Prestador de serviços profissional",
      serviceType: "Beleza",
      phone: "(11) 98765-4321",
      email: "servico@email.com",
    });
  }, []);

  const handleAddService = async () => {
    if (!newService.name || !newService.price) {
      toast({
        title: "Erro",
        description: "Nome e preço são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const service: Service = {
      id: Math.random().toString(36).substr(2, 9),
      name: newService.name!,
      description: newService.description || "",
      price: newService.price!,
      duration: newService.duration || 60,
      available: true,
    };

    setServices([...services, service]);
    setNewService({
      name: "",
      description: "",
      price: 0,
      duration: 60,
      available: true,
    });

    toast({
      title: "Sucesso",
      description: "Serviço adicionado com sucesso!",
    });
  };

  const handleDeleteService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
    toast({
      title: "Serviço removido",
    });
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
  };

  const handleUpdateService = async () => {
    if (!editingService) return;

    setServices(
      services.map((s) => (s.id === editingService.id ? editingService : s))
    );
    setEditingService(null);
    toast({
      title: "Serviço atualizado",
    });
  };

  if (!provider) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">
          <div className="h-12 w-12 bg-primary rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Perfil de Serviços</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info" data-testid="tab-info">
              Informações
            </TabsTrigger>
            <TabsTrigger value="services" data-testid="tab-services">
              Serviços ({services.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB: INFORMAÇÕES */}
          <TabsContent value="info" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Editar Informações do Serviço</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Prestador</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    defaultValue={provider.name}
                    data-testid="input-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva seus serviços..."
                    defaultValue={provider.description}
                    rows={4}
                    data-testid="textarea-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceType">Tipo de Serviço</Label>
                  <Input
                    id="serviceType"
                    placeholder="Ex: Beleza, Reparos, Limpeza"
                    defaultValue={provider.serviceType}
                    data-testid="input-service-type"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 98765-4321"
                    defaultValue={provider.phone}
                    data-testid="input-phone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    defaultValue={provider.email}
                    data-testid="input-email"
                  />
                </div>

                <Button data-testid="button-save-info">Salvar Informações</Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB: SERVIÇOS */}
          <TabsContent value="services" className="space-y-6">
            {editingService ? (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Editar Serviço</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nome do Serviço</Label>
                    <Input
                      id="edit-name"
                      value={editingService.name}
                      onChange={(e) =>
                        setEditingService({ ...editingService, name: e.target.value })
                      }
                      data-testid="input-edit-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Descrição</Label>
                    <Textarea
                      id="edit-description"
                      value={editingService.description}
                      onChange={(e) =>
                        setEditingService({
                          ...editingService,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      data-testid="textarea-edit-description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-price">Preço (R$)</Label>
                      <Input
                        id="edit-price"
                        type="number"
                        step="0.01"
                        value={editingService.price}
                        onChange={(e) =>
                          setEditingService({
                            ...editingService,
                            price: parseFloat(e.target.value),
                          })
                        }
                        data-testid="input-edit-price"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-duration">Duração (min)</Label>
                      <Input
                        id="edit-duration"
                        type="number"
                        value={editingService.duration}
                        onChange={(e) =>
                          setEditingService({
                            ...editingService,
                            duration: parseInt(e.target.value),
                          })
                        }
                        data-testid="input-edit-duration"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdateService}
                      data-testid="button-update-service"
                    >
                      Salvar Alterações
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingService(null)}
                      data-testid="button-cancel-edit"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Adicionar Novo Serviço</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="service-name">Nome do Serviço *</Label>
                    <Input
                      id="service-name"
                      placeholder="Ex: Corte de Cabelo"
                      value={newService.name || ""}
                      onChange={(e) =>
                        setNewService({ ...newService, name: e.target.value })
                      }
                      data-testid="input-service-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service-description">Descrição</Label>
                    <Textarea
                      id="service-description"
                      placeholder="Descreva o serviço..."
                      value={newService.description || ""}
                      onChange={(e) =>
                        setNewService({ ...newService, description: e.target.value })
                      }
                      rows={3}
                      data-testid="textarea-service-description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="service-price">Preço (R$) *</Label>
                      <Input
                        id="service-price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newService.price || ""}
                        onChange={(e) =>
                          setNewService({
                            ...newService,
                            price: parseFloat(e.target.value),
                          })
                        }
                        data-testid="input-service-price"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="service-duration">Duração (minutos)</Label>
                      <Input
                        id="service-duration"
                        type="number"
                        placeholder="60"
                        value={newService.duration || ""}
                        onChange={(e) =>
                          setNewService({
                            ...newService,
                            duration: parseInt(e.target.value) || 60,
                          })
                        }
                        data-testid="input-service-duration"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleAddService}
                    className="w-full"
                    data-testid="button-add-service"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Serviço
                  </Button>
                </div>
              </Card>
            )}

            {/* LISTA DE SERVIÇOS */}
            {services.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Serviços Cadastrados</h2>
                <div className="space-y-3">
                  {services.map((service) => (
                    <Card key={service.id} className="p-4" data-testid={`card-service-${service.id}`}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{service.name}</h3>
                            <Badge
                              variant={service.available ? "default" : "secondary"}
                              data-testid={`badge-status-${service.id}`}
                            >
                              {service.available ? "Disponível" : "Indisponível"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {service.description}
                          </p>
                          <div className="flex gap-4">
                            <p className="font-semibold text-lg">R$ {service.price.toFixed(2)}</p>
                            {service.duration && (
                              <p className="text-sm text-muted-foreground">
                                {service.duration}min
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleEditService(service)}
                            data-testid={`button-edit-${service.id}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDeleteService(service.id)}
                            data-testid={`button-delete-${service.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {services.length === 0 && !editingService && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Nenhum serviço cadastrado ainda. Adicione seus primeiros serviços acima!
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
