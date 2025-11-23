import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, LogIn } from "lucide-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Logo & Title */}
      <div className="text-center mb-12 space-y-4">
        <div className="text-5xl font-bold text-primary">
          CondoPlace
        </div>
        <p className="text-lg text-muted-foreground max-w-md">
          Conectando moradores, lojas e serviços dentro do seu condomínio.
        </p>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-md space-y-4">
        <Button 
          onClick={() => setLocation("/select-condo")} 
          size="lg"
          className="w-full h-12 text-base"
          data-testid="button-select-condo"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Selecionar Condomínio
        </Button>

        <Button 
          onClick={() => setLocation("/register-condo")} 
          variant="outline"
          size="lg"
          className="w-full h-12 text-base"
          data-testid="button-register-condo"
        >
          <Plus className="w-4 h-4 mr-2" />
          Registrar Condomínio
        </Button>
      </div>

      {/* Admin Link */}
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/admin/login")}
          data-testid="button-admin-login"
          className="text-xs"
        >
          Admin
        </Button>
      </div>
    </div>
  );
}
