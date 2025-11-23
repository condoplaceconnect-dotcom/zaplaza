import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PhotoUpload from "@/components/PhotoUpload";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CondoRegistrationPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [photo, setPhoto] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // TODO: Remover dados mock quando integrar com backend
  const [registeredCondos] = useState([
    'Residencial Jardim das Flores',
    'Condomínio Vila Verde'
  ]);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    units: '',
    phone: '',
    email: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validação: Condomínio duplicado
    if (registeredCondos.some(c => c.toLowerCase() === formData.name.toLowerCase())) {
      setError('Este condomínio já está cadastrado no sistema. Um único perfil é permitido por condomínio.');
      setLoading(false);
      return;
    }

    // Simular delay de registro
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Condomínio Registrado!",
      description: `${formData.name} foi cadastrado com sucesso como localização.`,
    });

    setLoading(false);
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Registrar Condomínio</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Foto do Condomínio</h2>
              <PhotoUpload
                currentPhoto={photo}
                name={formData.name || 'Condomínio'}
                onPhotoChange={setPhoto}
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Informações Básicas</h2>
              
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Condomínio *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Residencial Jardim das Flores"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  data-testid="input-condo-name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="units">Número de Unidades *</Label>
                  <Input
                    id="units"
                    type="number"
                    placeholder="Ex: 120"
                    value={formData.units}
                    onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                    required
                    data-testid="input-units"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 98765-4321"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    data-testid="input-phone"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email de Contato</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contato@condominio.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição do Condomínio</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva características do condomínio..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="resize-none"
                  rows={4}
                  data-testid="textarea-description"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Endereço</h2>
              
              <div className="space-y-2">
                <Label htmlFor="address">Rua e Número *</Label>
                <Input
                  id="address"
                  placeholder="Ex: Avenida Paulista, 1000"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  data-testid="input-address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    placeholder="São Paulo"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    data-testid="input-city"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado *</Label>
                  <Input
                    id="state"
                    placeholder="SP"
                    maxLength={2}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    required
                    data-testid="input-state"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP *</Label>
                  <Input
                    id="zipCode"
                    placeholder="01310-100"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    required
                    data-testid="input-zipcode"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/')}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                data-testid="button-register"
              >
                {loading ? 'Registrando...' : 'Registrar Condomínio'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
