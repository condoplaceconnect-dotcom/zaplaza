import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PhotoUpload from "@/components/PhotoUpload";
import { ArrowLeft, AlertCircle, CheckCircle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Suggestion {
  label: string;
  value: string;
}

const BR_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const CITIES_BY_STATE: Record<string, string[]> = {
  "SP": ["São Paulo", "Campinas", "Santos", "Sorocaba", "Ribeirão Preto"],
  "RJ": ["Rio de Janeiro", "Niterói", "Duque de Caxias", "Nova Iguaçu"],
  "MG": ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora"],
  "RS": ["Porto Alegre", "Caxias do Sul", "Canoas", "Pelotas", "Santa Maria"],
  "BA": ["Salvador", "Feira de Santana", "Vitória da Conquista", "Ilhéus"],
};

export default function CondoRegistrationPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [photo, setPhoto] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [citySuggestions, setCitySuggestions] = useState<Suggestion[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [streetSuggestions, setStreetSuggestions] = useState<Suggestion[]>([]);
  const [showStreetSuggestions, setShowStreetSuggestions] = useState(false);

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

  // Handle state change - update available cities
  const handleStateChange = (newState: string) => {
    setFormData({ ...formData, state: newState.toUpperCase(), city: '' });
    setCitySuggestions([]);
    setShowCitySuggestions(false);
  };

  // Handle city input - show suggestions
  const handleCityInput = (value: string) => {
    setFormData({ ...formData, city: value });
    
    if (value.length > 0 && formData.state) {
      const cities = CITIES_BY_STATE[formData.state] || [];
      const filtered = cities.filter(city =>
        city.toLowerCase().includes(value.toLowerCase())
      );
      setCitySuggestions(
        filtered.map(city => ({ label: city, value: city }))
      );
      setShowCitySuggestions(true);
    } else {
      setShowCitySuggestions(false);
    }
  };

  // Handle city suggestion click
  const handleCitySuggestionClick = (city: string) => {
    setFormData({ ...formData, city });
    setShowCitySuggestions(false);
  };

  // Handle street input - show suggestions
  const handleStreetInput = (value: string) => {
    setFormData({ ...formData, address: value });
    
    if (value.length > 1) {
      // Simular sugestões de rua (em produção, usar Google Maps API)
      const mockStreets = [
        `${value} - Avenida`,
        `${value} - Rua`,
        `${value} - Travessa`,
      ];
      setStreetSuggestions(
        mockStreets.map(street => ({ label: street, value: street }))
      );
      setShowStreetSuggestions(true);
    } else {
      setShowStreetSuggestions(false);
    }
  };

  // Handle street suggestion click
  const handleStreetSuggestionClick = (street: string) => {
    setFormData({ ...formData, address: street });
    setShowStreetSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name || !formData.address || !formData.city || !formData.state || !formData.zipCode || !formData.units) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    try {
      // Enviar para API
      const response = await fetch('/api/condominiums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          units: parseInt(formData.units),
          image: photo || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar solicitação');
      }

      setLoading(false);
      setSubmitted(true);

      toast({
        title: "Solicitação Enviada!",
        description: `${formData.name} foi enviado para aprovação do administrador.`,
      });
    } catch (err) {
      setError('Erro ao enviar solicitação. Tente novamente.');
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Solicitação Enviada!</h2>
            <p className="text-muted-foreground mb-4">
              {formData.name} foi submetido para aprovação. Um administrador analisará seu cadastro em breve.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Você receberá um email de confirmação quando sua solicitação for aprovada.
            </p>
          </div>
          <Button 
            onClick={() => setLocation('/')}
            data-testid="button-back-home"
            className="w-full"
          >
            Voltar ao Início
          </Button>
        </Card>
      </div>
    );
  }

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
          <h1 className="text-xl font-bold">Solicitar Registro de Condomínio</h1>
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

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Sua solicitação será analisada por um administrador. Você receberá uma confirmação por email quando for aprovada.
              </AlertDescription>
            </Alert>

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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">Estado *</Label>
                  <select
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    data-testid="select-state"
                  >
                    <option value="">Selecione</option>
                    {BR_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 relative">
                  <Label htmlFor="city">Cidade *</Label>
                  <div className="relative">
                    <Input
                      id="city"
                      placeholder="Digite a cidade"
                      value={formData.city}
                      onChange={(e) => handleCityInput(e.target.value)}
                      onFocus={() => formData.city.length > 0 && setShowCitySuggestions(true)}
                      required
                      data-testid="input-city"
                    />
                    {showCitySuggestions && citySuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-card border border-t-0 rounded-b-md shadow-md z-10" data-testid="dropdown-cities">
                        {citySuggestions.map((city, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleCitySuggestionClick(city.value)}
                            className="w-full text-left px-3 py-2 hover:bg-muted"
                            data-testid={`option-city-${idx}`}
                          >
                            {city.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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

              <div className="space-y-2 relative">
                <Label htmlFor="address">Rua e Número *</Label>
                <div className="relative">
                  <Input
                    id="address"
                    placeholder="Ex: Avenida Paulista, 1000"
                    value={formData.address}
                    onChange={(e) => handleStreetInput(e.target.value)}
                    onFocus={() => formData.address.length > 1 && setShowStreetSuggestions(true)}
                    required
                    data-testid="input-address"
                  />
                  {showStreetSuggestions && streetSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-card border border-t-0 rounded-b-md shadow-md z-10" data-testid="dropdown-streets">
                      {streetSuggestions.map((street, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleStreetSuggestionClick(street.value)}
                          className="w-full text-left px-3 py-2 hover:bg-muted"
                          data-testid={`option-street-${idx}`}
                        >
                          {street.label}
                        </button>
                      ))}
                    </div>
                  )}
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
                data-testid="button-submit-request"
              >
                {loading ? 'Enviando...' : 'Enviar Solicitação'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
