import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";

export default function CondoStatusPage() {
  const { condoStatus } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full text-center">
        {condoStatus === 'pending' ? (
          <div data-testid="pending-status">
            <Clock className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Aguardando Aprovação</h1>
            <p className="text-muted-foreground mb-6">
              O seu condomínio foi registrado e está aguardando a aprovação de um administrador. Você será notificado por e-mail assim que for aprovado.
            </p>
          </div>
        ) : (
          <div data-testid="rejected-status">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Registro Rejeitado</h1>
            <p className="text-muted-foreground mb-6">
              Infelizmente, o registro do seu condomínio não foi aprovado. Por favor, entre em contato com o suporte para mais informações.
            </p>
          </div>
        )}

        <Button className="w-full" onClick={handleLogout} data-testid="button-logout">
          Sair
        </Button>
      </Card>
    </div>
  );
}
