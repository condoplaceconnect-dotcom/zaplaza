import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, LogOut, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PendingApprovalPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedCondoId");
    toast({ title: "Até logo!", description: "Você foi desconectado." });
    setLocation("/");
  };

  const handleGoBack = () => {
    localStorage.removeItem("selectedCondoId");
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900">
            <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold mb-2">Aguardando Aprovação</h1>
          <p className="text-muted-foreground">
            Sua solicitação de acesso ao condomínio está sendo analisada pelo administrador.
          </p>
        </div>

        <div className="bg-secondary/50 p-4 rounded-lg">
          <p className="text-sm">
            <strong>Próximos passos:</strong>
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1 text-left">
            <li>• Você receberá um email quando for aprovado</li>
            <li>• Pode demorar até 24 horas</li>
            <li>• Volte aqui para acessar o app quando aprovado</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Button variant="outline" onClick={handleGoBack} data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Selecionar Outro Condomínio
          </Button>

          <Button variant="ghost" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="w-4 h-4 mr-2" />
            Sair da Conta
          </Button>
        </div>
      </Card>
    </div>
  );
}
