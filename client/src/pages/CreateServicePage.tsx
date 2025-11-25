import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export default function CreateServicePage() {
  const [, setLocation] = useLocation();
  const { token } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [pricingType, setPricingType] = useState('fixed');
  const [price, setPrice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!title || !category || !price) {
        setError("Por favor, preencha todos os campos obrigatórios.");
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
            title,
            description,
            category,
            pricingType,
            price: parseFloat(price),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Falha ao criar o serviço.');
      }

      setLocation('/services');

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Oferecer um Serviço</h1>
      <div className="bg-card p-6 rounded-xl shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="serviceTitle">Título do Serviço</Label>
            <Input id="serviceTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Aula de violão para iniciantes" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceCategory">Categoria</Label>
            <Select onValueChange={setCategory} value={category}>
                <SelectTrigger id="serviceCategory"><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="classes">Aulas e Cursos</SelectItem>
                    <SelectItem value="repairs">Reparos e Manutenção</SelectItem>
                    <SelectItem value="beauty">Beleza e Estética</SelectItem>
                    <SelectItem value="events">Eventos</SelectItem>
                    <SelectItem value="health">Saúde e Bem-estar</SelectItem>
                    <SelectItem value="tech">Tecnologia</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceDescription">Descrição detalhada (Opcional)</Label>
            <Textarea id="serviceDescription" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva o que você oferece, sua experiência, etc." />
          </div>

          <div className="space-y-2">
            <Label>Forma de Cobrança</Label>
            <RadioGroup value={pricingType} onValueChange={setPricingType} className="flex gap-4">
              <div className="flex items-center space-x-2"><RadioGroupItem value="fixed" id="fixed" /><Label htmlFor="fixed">Preço Fixo</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="hourly" id="hourly" /><Label htmlFor="hourly">Por Hora</Label></div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="servicePrice">Preço (R$)</Label>
            <Input id="servicePrice" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder={pricingType === 'hourly' ? "50,00" : "200,00"} required />
          </div>

          {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

          <Button type="submit" disabled={isLoading} className="w-full text-lg py-6">
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />} 
            Publicar Serviço
          </Button>
        </form>
      </div>
    </div>
  );
}
