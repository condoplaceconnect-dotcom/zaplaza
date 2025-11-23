import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BR_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function CondoRegistrationPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    units: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.address || !formData.city || !formData.state) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/condominiums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          units: parseInt(formData.units) || 0,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao criar condomínio");
      }

      const condo = await res.json();
      localStorage.setItem("selectedCondoId", condo.id);
      
      toast({ title: "Sucesso!", description: "Condomínio registrado com sucesso" });
      setSubmitted(true);

      setTimeout(() => {
        setLocation("/register");
      }, 1500);

    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Condomínio Registrado!</h2>
          <p className="text-muted-foreground mb-6">Redirecionando para criar sua conta...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Registrar Condomínio</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Sua solicitação será analisada. Você receberá um email de confirmação.
          </AlertDescription>
        </Alert>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Nome do Condomínio *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ex: Condomínio Acqua Sena"
                value={formData.name}
                onChange={handleChange}
                required
                data-testid="input-condo-name"
              />
            </div>

            <div>
              <Label htmlFor="address">Endereço *</Label>
              <Input
                id="address"
                name="address"
                placeholder="Ex: Rua Principal, 100"
                value={formData.address}
                onChange={handleChange}
                required
                data-testid="input-address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">Estado *</Label>
                <Select value={formData.state} onValueChange={(v) => setFormData({...formData, state: v})}>
                  <SelectTrigger id="state" data-testid="select-state">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {BR_STATES.map(st => (
                      <SelectItem key={st} value={st}>{st}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Ex: São Paulo"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  data-testid="input-city"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  placeholder="00000-000"
                  value={formData.zipCode}
                  onChange={handleChange}
                  data-testid="input-zipcode"
                />
              </div>

              <div>
                <Label htmlFor="units">Número de Unidades</Label>
                <Input
                  id="units"
                  name="units"
                  type="number"
                  placeholder="Ex: 150"
                  value={formData.units}
                  onChange={handleChange}
                  data-testid="input-units"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-submit">
              {isLoading ? "Enviando..." : "Registrar Condomínio"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
