import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import ThemeToggle from "@/components/ThemeToggle";
import BottomNav from "@/components/BottomNav";
import { useLocation } from "wouter";
import { ArrowLeft, Bell, Lock, User, Building2, LogOut } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    appointments: true,
    promotions: false,
  });

  const handleSaveProfile = () => {
    toast({
      title: "Perfil Atualizado",
      description: "Suas informações foram salvas com sucesso.",
    });
  };

  const handleChangePassword = () => {
    toast({
      title: "Senha Alterada",
      description: "Sua senha foi alterada com sucesso.",
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
              onClick={() => setLocation('/profile')}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Configurações</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Informações Pessoais</h2>
              <p className="text-sm text-muted-foreground">Atualize seus dados pessoais</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" defaultValue="João Silva" data-testid="input-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="joao.silva@email.com" data-testid="input-email" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" defaultValue="(11) 98765-4321" data-testid="input-phone" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unidade</Label>
                <Input id="unit" defaultValue="301" data-testid="input-unit" />
              </div>
            </div>
            <Button onClick={handleSaveProfile} data-testid="button-save-profile">
              Salvar Alterações
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Condomínio</h2>
              <p className="text-sm text-muted-foreground">Gerenciar informações do condomínio</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="font-medium">Condomínio Atual</p>
                <p className="text-sm text-muted-foreground">Carregando...</p>
              </div>
              <Button variant="outline" onClick={() => {
                localStorage.removeItem("selectedCondoId");
                window.location.href = "/";
              }} data-testid="button-change-condo">
                Alterar
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Notificações</h2>
              <p className="text-sm text-muted-foreground">Gerencie suas preferências de notificação</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Atualizações de Pedidos</p>
                <p className="text-sm text-muted-foreground">Receba notificações sobre status de pedidos</p>
              </div>
              <Switch
                checked={notifications.orderUpdates}
                onCheckedChange={(checked) => setNotifications({ ...notifications, orderUpdates: checked })}
                data-testid="switch-order-notifications"
              />
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Lembretes de Agendamento</p>
                <p className="text-sm text-muted-foreground">Receba lembretes sobre seus agendamentos</p>
              </div>
              <Switch
                checked={notifications.appointments}
                onCheckedChange={(checked) => setNotifications({ ...notifications, appointments: checked })}
                data-testid="switch-appointment-notifications"
              />
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Promoções e Ofertas</p>
                <p className="text-sm text-muted-foreground">Receba ofertas especiais de vendedores</p>
              </div>
              <Switch
                checked={notifications.promotions}
                onCheckedChange={(checked) => setNotifications({ ...notifications, promotions: checked })}
                data-testid="switch-promotion-notifications"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Segurança</h2>
              <p className="text-sm text-muted-foreground">Altere sua senha e configurações de segurança</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <Input id="current-password" type="password" data-testid="input-current-password" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input id="new-password" type="password" data-testid="input-new-password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input id="confirm-password" type="password" data-testid="input-confirm-password" />
              </div>
            </div>
            <Button onClick={handleChangePassword} data-testid="button-change-password">
              Alterar Senha
            </Button>
          </div>
        </Card>

        <Card className="p-6 border-destructive">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-destructive text-destructive-foreground">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Sair da Conta</h2>
              <p className="text-sm text-muted-foreground">Desconecte-se do aplicativo</p>
            </div>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" data-testid="button-logout">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza que deseja sair?</AlertDialogTitle>
                <AlertDialogDescription>
                  Você será desconectado do aplicativo e precisará fazer login novamente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-testid="button-cancel-logout">Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => {
                    toast({
                      title: "Até logo!",
                      description: "Você foi desconectado com sucesso.",
                    });
                  }}
                  data-testid="button-confirm-logout"
                >
                  Sair
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      </main>

      <BottomNav onNavigate={setLocation} />
    </div>
  );
}
