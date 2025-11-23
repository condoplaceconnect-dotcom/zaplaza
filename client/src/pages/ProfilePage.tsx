import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, LogOut, Building2, Edit, Save, X, ArrowLeft, Users } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  condoId: string | null;
}

interface Condominium {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
}

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showChangeCondoDialog, setShowChangeCondoDialog] = useState(false);

  const { data: authResponse, isLoading } = useQuery<{ user: UserProfile }>({
    queryKey: ["/api/auth/me"],
  });

  const user = authResponse?.user;

  const { data: condo } = useQuery<Condominium>({
    queryKey: user?.condoId ? [`/api/condominiums/${user.condoId}`] : [],
    enabled: !!user?.condoId,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user, isEditing]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user?.id) throw new Error("Usuário não identificado");
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Falha ao atualizar");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Perfil atualizado" });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar perfil",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedCondoId");
    toast({ title: "Até logo!", description: "Você saiu da conta" });
    setLocation("/");
  };

  const handleChangeCondo = () => {
    localStorage.removeItem("selectedCondoId");
    toast({
      title: "Condomínio alterado",
      description: "Selecione um novo condomínio",
    });
    setLocation("/select-condo");
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setIsEditing(false);
  };

  const getRoleName = (role: string) => {
    const roles: Record<string, string> = {
      admin: "Administrador",
      vendor: "Vendedor",
      resident: "Morador",
      service_provider: "Prestador de Serviço",
      delivery_person: "Entregador",
    };
    return roles[role] || role;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Erro ao carregar perfil</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/")}
                data-testid="button-back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold">Meu Perfil</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Informações Pessoais */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Informações Pessoais</h2>
                  <p className="text-sm text-muted-foreground">
                    {getRoleName(user.role)}
                  </p>
                </div>
              </div>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  data-testid="button-edit-profile"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    data-testid="button-cancel-edit"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label>Username</Label>
                <Input
                  value={user.username}
                  disabled
                  className="bg-muted"
                  data-testid="input-username"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  O username não pode ser alterado
                </p>
              </div>

              <div>
                <Label>Nome Completo</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={!isEditing}
                  data-testid="input-name"
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={!isEditing}
                  data-testid="input-email"
                />
              </div>

              <div>
                <Label>Telefone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="+55 11 99999-9999"
                  data-testid="input-phone"
                />
              </div>

              <div>
                <Label>Status da Conta</Label>
                <div className="mt-2">
                  <Badge variant={user.status === 'approved' ? 'default' : 'secondary'}>
                    {user.status === 'approved' ? 'Aprovado' : user.status}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Condomínio */}
          {condo && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Condomínio</h2>
                    <p className="text-sm text-muted-foreground">{condo.name}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowChangeCondoDialog(true)}
                  data-testid="button-change-condo"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Mudar
                </Button>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  {condo.address}, {condo.city} - {condo.state}
                </p>
              </div>
            </Card>
          )}

          {/* Ações */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Configurações da Conta</h2>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setLocation("/family")}
                data-testid="button-family-account"
              >
                <Users className="w-4 h-4 mr-2" />
                Conta Família
              </Button>
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={() => setShowLogoutDialog(true)}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair da Conta
              </Button>
            </div>
          </Card>
        </div>
      </main>

      {/* Logout Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair da conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Você será desconectado e precisará fazer login novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-logout">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              data-testid="button-confirm-logout"
            >
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Condo Dialog */}
      <AlertDialog
        open={showChangeCondoDialog}
        onOpenChange={setShowChangeCondoDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mudar de condomínio?</AlertDialogTitle>
            <AlertDialogDescription>
              Você será redirecionado para selecionar um novo condomínio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-change-condo">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleChangeCondo}
              data-testid="button-confirm-change-condo"
            >
              Mudar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
