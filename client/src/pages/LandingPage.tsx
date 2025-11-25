import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, LogIn } from "lucide-react";

interface User {
  condoId?: string;
  // add other user properties here if needed
}

export default function LandingPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user: User = JSON.parse(userStr);
          if (user.condoId) {
            localStorage.setItem("selectedCondoId", user.condoId);
            setLocation("/home");
          } else {
            // If the user has no associated condo, let them select one.
            setLocation("/select-condo");
          }
        } catch (error) {
          console.error("Failed to parse user data from localStorage", error);
          // If user data is corrupted, force re-login
          setLocation("/login");
        }
      } else {
        // If there's a token but no user data, the state is inconsistent.
        // Force re-login to fix it.
        setLocation("/login");
      }
    }
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Logo & Title */}
      <div className="text-center mb-12 space-y-4">
        <div className="text-5xl font-bold text-primary">
          Zaplaza
        </div>
        <p className="text-lg text-muted-foreground max-w-md">
          Conectando moradores, lojas e serviços dentro do seu condomínio.
        </p>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-md space-y-4">
        <Button 
          onClick={() => setLocation("/login")} 
          size="lg"
          className="w-full h-12 text-base"
          data-testid="button-login"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Entrar
        </Button>

        <Button 
          onClick={() => setLocation("/select-condo")} 
          variant="outline"
          size="lg"
          className="w-full h-12 text-base"
          data-testid="button-select-condo"
        >
          <Plus className="w-4 h-4 mr-2" />
          Criar Conta
        </Button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setLocation("/register-condo")}
            data-testid="button-register-condo"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline cursor-pointer"
          >
            Solicitar Registro de Novo Condomínio
          </button>
        </div>
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
