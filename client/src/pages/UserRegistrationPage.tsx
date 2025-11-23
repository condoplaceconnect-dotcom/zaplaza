import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type UserType = 'resident' | 'vendor' | 'delivery_person';

const STORE_CATEGORIES = [
  'Alimentos', 'Bebidas', 'Eletrônicos', 'Roupas', 'Farmacêuticos',
  'Livros', 'Beleza', 'Esportes', 'Casa', 'Flores'
];

const SERVICE_TYPES = [
  'Limpeza', 'Encanador', 'Eletricista', 'Pintor', 'Personal Trainer',
  'Cabeleireiro', 'Manicure', 'Consultoria', 'Fotografia', 'Tradução'
];

export default function UserRegistrationPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<UserType>('resident');
  
  const selectedCondoId = localStorage.getItem("selectedCondoId");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    block: "",
    unit: "",
    storeName: "",
    storeCategory: "",
    serviceType: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações obrigatórias
    if (!formData.name || !formData.email || !formData.phone || !formData.username || !formData.password || !formData.birthDate || !formData.block || !formData.unit) {
      toast({ title: "Erro", description: "Todos os campos obrigatórios devem ser preenchidos", variant: "destructive" });
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({ title: "Erro", description: "Email inválido", variant: "destructive" });
      return;
    }

    // Validação de telefone (mínimo 10 dígitos)
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      toast({ title: "Erro", description: "Telefone deve ter no mínimo 10 dígitos", variant: "destructive" });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem", variant: "destructive" });
      return;
    }

    if (formData.password.length < 6) {
      toast({ title: "Erro", description: "Senha deve ter no mínimo 6 caracteres", variant: "destructive" });
      return;
    }

    if (userType === 'vendor' && !formData.storeName) {
      toast({ title: "Erro", description: "Nome da loja/serviço obrigatório", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Registrar usuário
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          username: formData.username,
          password: formData.password,
          birthDate: formData.birthDate,
          block: formData.block,
          unit: formData.unit,
          role: userType,
          condoId: selectedCondoId,
        }),
      });

      if (!registerRes.ok) {
        const err = await registerRes.json();
        throw new Error(err.error || "Erro ao registrar");
      }

      const { token, user } = await registerRes.json();
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ 
        id: user.id, 
        username: user.username, 
        role: user.role,
        status: user.status || "approved" 
      }));

      // 2. Se vendor, criar loja
      if (userType === 'vendor') {
        const storeRes = await fetch("/api/stores", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.storeName,
            category: formData.storeCategory || formData.serviceType,
            userId: user.id,
            condoId: selectedCondoId,
          }),
        });

        if (!storeRes.ok) {
          console.error("Erro ao criar loja");
        }
      }

      toast({ 
        title: "Conta criada com sucesso!", 
        description: "Aguardando aprovação do administrador do condomínio..." 
      });
      
      // Redirecionar para tela de aprovação pendente
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);

    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedCondoId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full">
          <p className="text-center mb-4">Selecione um condomínio primeiro</p>
          <Button className="w-full" onClick={() => setLocation("/")} data-testid="button-select-condo">
            Voltar para Seleção
          </Button>
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
          <h1 className="text-xl font-bold">Criar Conta</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <Tabs value={userType} onValueChange={(v) => setUserType(v as UserType)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="resident" data-testid="tab-resident">Morador</TabsTrigger>
            <TabsTrigger value="vendor" data-testid="tab-vendor">Loja/Serviço</TabsTrigger>
            <TabsTrigger value="delivery_person" data-testid="tab-delivery">Entregador</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PERSONAL INFO */}
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Dados Pessoais</h2>
              
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  data-testid="input-name"
                />
              </div>

              <div>
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  data-testid="input-email"
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(51) 99999-9999"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  data-testid="input-phone"
                />
              </div>

              <div>
                <Label htmlFor="birthDate">Data de Nascimento *</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleChange}
                  required
                  data-testid="input-birthdate"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="block">Bloco *</Label>
                  <Input
                    id="block"
                    name="block"
                    placeholder="Ex: A, B, C"
                    value={formData.block}
                    onChange={handleChange}
                    required
                    data-testid="input-block"
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Apartamento *</Label>
                  <Input
                    id="unit"
                    name="unit"
                    placeholder="Ex: 101, 205"
                    value={formData.unit}
                    onChange={handleChange}
                    required
                    data-testid="input-unit"
                  />
                </div>
              </div>
            </Card>

            {/* CREDENTIALS */}
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Credenciais de Acesso</h2>
              
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="seu_username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  data-testid="input-username"
                />
              </div>

              <div>
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  data-testid="input-password"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirme sua senha"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  data-testid="input-confirm-password"
                />
              </div>
            </Card>

            {/* VENDOR FIELDS */}
            {userType === 'vendor' && (
              <Card className="p-6 space-y-4">
                <h2 className="text-lg font-semibold">Informações da Loja/Serviço</h2>
                
                <div>
                  <Label htmlFor="storeName">Nome da Loja/Serviço *</Label>
                  <Input
                    id="storeName"
                    name="storeName"
                    placeholder="Ex: Padaria do João"
                    value={formData.storeName}
                    onChange={handleChange}
                    required={userType === 'vendor'}
                    data-testid="input-store-name"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select value={formData.storeCategory} onValueChange={(v) => setFormData({...formData, storeCategory: v})}>
                    <SelectTrigger id="category" data-testid="select-category">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {STORE_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="serviceType">Tipo de Serviço (opcional)</Label>
                  <Select value={formData.serviceType} onValueChange={(v) => setFormData({...formData, serviceType: v})}>
                    <SelectTrigger id="serviceType" data-testid="select-service">
                      <SelectValue placeholder="Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_TYPES.map(svc => (
                        <SelectItem key={svc} value={svc}>{svc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            )}

            <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-register">
              {isLoading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>
        </Tabs>
      </main>
    </div>
  );
}
