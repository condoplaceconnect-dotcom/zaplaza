import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import PhotoUpload from "@/components/PhotoUpload";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type UserType = 'customer' | 'vendor' | 'delivery';

export default function UserRegistrationPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [userType, setUserType] = useState<UserType>('customer');
  const [photo, setPhoto] = useState('');

  // TODO: Remover dados mock quando integrar com backend
  const [condos] = useState([
    'Residencial Jardim das Flores',
    'Condomínio Vila Verde',
    'Edifício Solar do Parque'
  ]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    condo: '',
    block: '',
    apartment: '',
    storeName: '',
    serviceType: '',
    addressPrivacy: false,
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Cadastro Realizado!",
      description: `Bem-vindo ao ${userType === 'customer' ? 'CondomínioMarket' : userType === 'vendor' ? 'nosso marketplace de vendedores' : 'nossa plataforma de entregadores'}!`,
    });

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
          <h1 className="text-xl font-bold">Criar Conta</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Tabs value={userType} onValueChange={(v) => setUserType(v as UserType)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="customer" data-testid="tab-customer">Cliente</TabsTrigger>
            <TabsTrigger value="vendor" data-testid="tab-vendor">Vendedor</TabsTrigger>
            <TabsTrigger value="delivery" data-testid="tab-delivery">Entregador</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="customer" className="space-y-6">
              <Card className="p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Foto de Perfil</h2>
                  <PhotoUpload
                    currentPhoto={photo}
                    name={formData.name || 'Cliente'}
                    onPhotoChange={setPhoto}
                  />
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Informações Pessoais</h2>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      placeholder="João Silva"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      data-testid="input-name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="joao@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        data-testid="input-email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        placeholder="(11) 98765-4321"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        data-testid="input-phone"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Endereço (Privado - Não Exibido Publicamente)</h2>
                  
                  <div className="space-y-2">
                    <Label htmlFor="condo">Condomínio *</Label>
                    <Select value={formData.condo} onValueChange={(v) => setFormData({ ...formData, condo: v })}>
                      <SelectTrigger data-testid="select-condo">
                        <SelectValue placeholder="Selecione seu condomínio" />
                      </SelectTrigger>
                      <SelectContent>
                        {condos.map(c => (
                          <SelectItem key={c} value={c} data-testid={`option-condo-${c}`}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="block">Bloco *</Label>
                      <Input
                        id="block"
                        placeholder="A"
                        value={formData.block}
                        onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                        required
                        data-testid="input-block"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apartment">Apartamento *</Label>
                      <Input
                        id="apartment"
                        placeholder="301"
                        value={formData.apartment}
                        onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                        required
                        data-testid="input-apartment"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Segurança</h2>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={8}
                      data-testid="input-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Senha *</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Repita sua senha"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      data-testid="input-confirm-password"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="vendor" className="space-y-6">
              <Card className="p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Foto da Loja</h2>
                  <PhotoUpload
                    currentPhoto={photo}
                    name={formData.storeName || 'Minha Loja'}
                    onPhotoChange={setPhoto}
                  />
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Informações Pessoais</h2>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vendor-name">Nome Completo *</Label>
                    <Input
                      id="vendor-name"
                      placeholder="Maria Santos"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      data-testid="input-vendor-name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vendor-email">Email *</Label>
                      <Input
                        id="vendor-email"
                        type="email"
                        placeholder="maria@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        data-testid="input-vendor-email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vendor-phone">Telefone *</Label>
                      <Input
                        id="vendor-phone"
                        placeholder="(11) 98765-4321"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        data-testid="input-vendor-phone"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Informações da Loja</h2>
                  
                  <div className="space-y-2">
                    <Label htmlFor="store-name">Nome da Loja *</Label>
                    <Input
                      id="store-name"
                      placeholder="Doces da Maria"
                      value={formData.storeName}
                      onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                      required
                      data-testid="input-store-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service-type">Categoria *</Label>
                    <Input
                      id="service-type"
                      placeholder="Ex: Sobremesas, Lanches, Roupas..."
                      value={formData.serviceType}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                      required
                      data-testid="input-service-type"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Endereço</h2>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vendor-condo">Condomínio *</Label>
                    <Select value={formData.condo} onValueChange={(v) => setFormData({ ...formData, condo: v })}>
                      <SelectTrigger data-testid="select-vendor-condo">
                        <SelectValue placeholder="Selecione seu condomínio" />
                      </SelectTrigger>
                      <SelectContent>
                        {condos.map(c => (
                          <SelectItem key={c} value={c} data-testid={`option-vendor-condo-${c}`}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vendor-block">Bloco *</Label>
                      <Input
                        id="vendor-block"
                        placeholder="A"
                        value={formData.block}
                        onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                        required
                        data-testid="input-vendor-block"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vendor-apartment">Apartamento *</Label>
                      <Input
                        id="vendor-apartment"
                        placeholder="405"
                        value={formData.apartment}
                        onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                        required
                        data-testid="input-vendor-apartment"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                    <Switch
                      checked={formData.addressPrivacy}
                      onCheckedChange={(checked) => setFormData({ ...formData, addressPrivacy: checked })}
                      data-testid="switch-address-privacy"
                    />
                    <div>
                      <p className="font-medium">Mostrar endereço publicamente</p>
                      <p className="text-sm text-muted-foreground">
                        {formData.addressPrivacy ? 'Seu endereço será visível para clientes' : 'Seu endereço será privado'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Segurança</h2>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vendor-password">Senha *</Label>
                    <Input
                      id="vendor-password"
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={8}
                      data-testid="input-vendor-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vendor-confirm-password">Confirmar Senha *</Label>
                    <Input
                      id="vendor-confirm-password"
                      type="password"
                      placeholder="Repita sua senha"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      data-testid="input-vendor-confirm-password"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="delivery" className="space-y-6">
              <Card className="p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Foto de Perfil</h2>
                  <PhotoUpload
                    currentPhoto={photo}
                    name={formData.name || 'Entregador'}
                    onPhotoChange={setPhoto}
                  />
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Informações Pessoais</h2>
                  
                  <div className="space-y-2">
                    <Label htmlFor="delivery-name">Nome Completo *</Label>
                    <Input
                      id="delivery-name"
                      placeholder="Pedro Rocha"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      data-testid="input-delivery-name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="delivery-email">Email *</Label>
                      <Input
                        id="delivery-email"
                        type="email"
                        placeholder="pedro@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        data-testid="input-delivery-email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="delivery-phone">Telefone *</Label>
                      <Input
                        id="delivery-phone"
                        placeholder="(11) 98765-4321"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        data-testid="input-delivery-phone"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Endereço</h2>
                  
                  <div className="space-y-2">
                    <Label htmlFor="delivery-condo">Condomínio *</Label>
                    <Select value={formData.condo} onValueChange={(v) => setFormData({ ...formData, condo: v })}>
                      <SelectTrigger data-testid="select-delivery-condo">
                        <SelectValue placeholder="Selecione seu condomínio" />
                      </SelectTrigger>
                      <SelectContent>
                        {condos.map(c => (
                          <SelectItem key={c} value={c} data-testid={`option-delivery-condo-${c}`}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="delivery-block">Bloco *</Label>
                      <Input
                        id="delivery-block"
                        placeholder="A"
                        value={formData.block}
                        onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                        required
                        data-testid="input-delivery-block"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="delivery-apartment">Apartamento *</Label>
                      <Input
                        id="delivery-apartment"
                        placeholder="102"
                        value={formData.apartment}
                        onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                        required
                        data-testid="input-delivery-apartment"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                    <Switch
                      checked={formData.addressPrivacy}
                      onCheckedChange={(checked) => setFormData({ ...formData, addressPrivacy: checked })}
                      data-testid="switch-delivery-address-privacy"
                    />
                    <div>
                      <p className="font-medium">Mostrar endereço publicamente</p>
                      <p className="text-sm text-muted-foreground">
                        {formData.addressPrivacy ? 'Seu endereço será visível para clientes' : 'Seu endereço será privado'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Segurança</h2>
                  
                  <div className="space-y-2">
                    <Label htmlFor="delivery-password">Senha *</Label>
                    <Input
                      id="delivery-password"
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={8}
                      data-testid="input-delivery-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="delivery-confirm-password">Confirmar Senha *</Label>
                    <Input
                      id="delivery-confirm-password"
                      type="password"
                      placeholder="Repita sua senha"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      data-testid="input-delivery-confirm-password"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <div className="flex gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/')}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button type="submit" data-testid="button-register">
                Criar Conta
              </Button>
            </div>
          </form>
        </Tabs>
      </main>
    </div>
  );
}
