import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';

export default function CreateLostAndFoundPage() {
  const [, setLocation] = useLocation();
  const { token } = useAuth();

  const [type, setType] = useState('found');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocationText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!title || !location) {
      setError("Por favor, preencha o título e o local.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/lost-and-found', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type, title, description, location }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Falha ao registrar o item.');
      }

      setLocation('/lost-and-found');

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Registrar Item Perdido ou Achado</h1>
      <div className="bg-card p-6 rounded-xl shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>O que você quer registrar?</Label>
            <RadioGroup value={type} onValueChange={setType} className="flex gap-4">
              <div className="flex items-center space-x-2"><RadioGroupItem value="found" id="found" /><Label htmlFor="found">Encontrei um item</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="lost" id="lost" /><Label htmlFor="lost">Perdi um item</Label></div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemTitle">Título do Item</Label>
            <Input id="itemTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Chaves da marca X" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemDescription">Descrição (Opcional)</Label>
            <Textarea id="itemDescription" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva o item, cores, marcas, etc." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Local</Label>
            <Input id="location" value={location} onChange={(e) => setLocationText(e.target.value)} placeholder="Ex: Próximo à piscina do Bloco A" required />
          </div>

          {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

          <Button type="submit" disabled={isLoading} className="w-full text-lg py-6">
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />} 
            Registrar Item
          </Button>
        </form>
      </div>
    </div>
  );
}
