import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Condominium {
  id: string;
  name: string;
  address: string;
  city: string;
  units: number;
}

export default function CondoSelectorPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [condos, setCondos] = useState<Condominium[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar condominios aprovados
    const loadCondos = async () => {
      try {
        const response = await fetch("/api/condominiums");
        if (response.ok) {
          const data = await response.json();
          setCondos(data);
        }
      } catch (error) {
        console.error("Erro ao carregar condomínios:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCondos();
  }, []);

  const filteredCondos = condos.filter((condo) =>
    condo.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectCondo = (condoId: string) => {
    localStorage.setItem("selectedCondoId", condoId);
    setLocation("/register");
  };

  const handleRequestNewCondo = () => {
    setLocation("/register-condo");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">
          <div className="h-12 w-12 bg-primary rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Bem-vindo ao CondoPlace</h1>
          <p className="text-muted-foreground">Selecione seu condomínio para continuar</p>
        </div>

        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar condomínio..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search-condo"
              />
            </div>

            {filteredCondos.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">Nenhum condomínio encontrado</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Seu condomínio não está registrado ainda?
                </p>
                <Button
                  onClick={handleRequestNewCondo}
                  data-testid="button-register-new-condo"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Solicitar Registro de Novo Condomínio
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCondos.map((condo) => (
                  <button
                    key={condo.id}
                    onClick={() => handleSelectCondo(condo.id)}
                    className="w-full p-4 text-left border rounded-lg hover-elevate transition-all data-testid-condo"
                    data-testid={`card-condo-${condo.id}`}
                  >
                    <h3 className="font-semibold mb-1">{condo.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {condo.address}, {condo.city}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {condo.units} unidades
                    </p>
                  </button>
                ))}

                <div className="pt-4">
                  <Button
                    variant="outline"
                    onClick={handleRequestNewCondo}
                    className="w-full"
                    data-testid="button-request-condo"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Solicitar Registro de Novo Condomínio
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Após selecionar seu condomínio, você precisará se registrar como residente, vendedor ou prestador de serviço.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
