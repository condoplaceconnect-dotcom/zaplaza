import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import type { MarketplaceItem } from '@shared/schema';

export default function CreatePostPage() {
  const [, setLocation] = useLocation();
  const { token } = useAuth();

  // General State
  const [category, setCategory] = useState('marketplace');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  // Marketplace State
  const [marketplaceType, setMarketplaceType] = useState('sale');

  // Store State
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [hasStore, setHasStore] = useState<boolean | null>(null);
  const [isCheckingStore, setIsCheckingStore] = useState(false);

  // Loan State
  const [userItems, setUserItems] = useState<MarketplaceItem[]>([]);
  const [isFetchingItems, setIsFetchingItems] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [terms, setTerms] = useState('');

  const checkUserStore = useCallback(async () => {
    if (!token) return;
    setIsCheckingStore(true);
    setError(null);
    try {
      const response = await fetch('/api/my-store', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const store = await response.json();
        setHasStore(!!store);
      } else {
        setHasStore(false);
      }
    } catch (error) {
      setError('Não foi possível verificar se você possui uma loja.');
      setHasStore(false);
    } finally {
      setIsCheckingStore(false);
    }
  }, [token]);

  const fetchUserItems = useCallback(async () => {
    if (!token) return;
    setIsFetchingItems(true);
    try {
      const response = await fetch('/api/my-marketplace-items', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const items: MarketplaceItem[] = await response.json();
        setUserItems(items.filter(item => (item.type === 'donation' || item.type === 'exchange') && item.status === 'available'));
      } else {
        setUserItems([]);
      }
    } catch (error) {
      setError('Não foi possível buscar seus itens para empréstimo.');
    } finally {
      setIsFetchingItems(false);
    }
  }, [token]);

  useEffect(() => {
    if (category === 'store') {
      checkUserStore();
    } else if (category === 'loan') {
      fetchUserItems();
    }
  }, [category, checkUserStore, fetchUserItems]);

  const handleCreateMarketplaceItem = async () => {
    if (!title || !description || (marketplaceType === 'sale' && !price)) {
      return setError('Por favor, preencha todos os campos do marketplace.');
    }
    const body = JSON.stringify({
      title,
      description,
      price: marketplaceType === 'sale' ? price : null,
      type: marketplaceType,
      category: 'general',
    });
    return await postData('/api/marketplace', body);
  };

  const handleCreateStore = async () => {
    if (!storeName) {
      return setError('O nome da loja é obrigatório.');
    }
    const body = JSON.stringify({ name: storeName, description: storeDescription });
    const success = await postData('/api/stores', body, false); // Don't redirect yet
    if (success) {
      setHasStore(true); // Switch to the product form
      setError(null);
    }
  };

  const handleCreateProduct = async () => {
    if (!title || !price) {
      return setError('Título e preço do produto são obrigatórios.');
    }
    const body = JSON.stringify({ name: title, description, price });
    return await postData('/api/products', body);
  };

  const handleCreateLoan = async () => {
    const selectedItem = userItems.find(item => item.id === selectedItemId);
    if (!selectedItemId || !returnDate || !selectedItem) {
      return setError('Por favor, selecione um item e preencha a data de devolução.');
    }
    const body = JSON.stringify({
      itemId: selectedItemId,
      ownerId: selectedItem.userId,
      returnDate,
      terms,
    });
    await postData('/api/loans', body);
  };

  const postData = async (url: string, body: string, redirect = true) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Falha ao enviar dados para ${url}`)
      }
      if (redirect) {
        setLocation('/home');
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    switch (category) {
      case 'marketplace':
        await handleCreateMarketplaceItem();
        break;
      case 'store':
        if (hasStore) {
          await handleCreateProduct();
        } else {
          await handleCreateStore();
        }
        break;
      case 'loan':
        await handleCreateLoan();
        break;
      default:
        setError('Esta categoria não está disponível no momento.');
    }
  };

  const renderMarketplaceForm = () => (
    <div className="space-y-6">
      <div className="space-y-2">
          <Label>Tipo de Anúncio</Label>
          <RadioGroup defaultValue="sale" value={marketplaceType} onValueChange={setMarketplaceType} className="flex gap-4">
              <div className="flex items-center space-x-2"><RadioGroupItem value="sale" id="sale" /><Label htmlFor="sale">Venda</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="donation" id="donation" /><Label htmlFor="donation">Doação</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="exchange" id="exchange" /><Label htmlFor="exchange">Troca</Label></div>
          </RadioGroup>
      </div>
      <div className="space-y-2"><Label htmlFor="title">Título</Label><Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Bicicleta Usada" required /></div>
      <div className="space-y-2"><Label htmlFor="description">Descrição</Label><Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes sobre o item" required /></div>
      {marketplaceType === 'sale' && (
        <div className="space-y-2"><Label htmlFor="price">Preço (R$)</Label><Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="50,00" required /></div>
      )}
    </div>
  );

  const renderStoreForm = () => {
    if (isCheckingStore) {
      return <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>;
    }
    if (hasStore === false) {
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Passo 1: Crie sua Loja</h2>
          <p className="text-muted-foreground">Para adicionar produtos, primeiro crie sua loja.</p>
          <div className="space-y-2"><Label htmlFor="storeName">Nome da Loja</Label><Input id="storeName" value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="Ex: Doces da Vovó" required /></div>
          <div className="space-y-2"><Label htmlFor="storeDescription">Descrição da Loja (Opcional)</Label><Textarea id="storeDescription" value={storeDescription} onChange={e => setStoreDescription(e.target.value)} placeholder="Sobre sua loja..." /></div>
        </div>
      );
    }
    if (hasStore === true) {
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Passo 2: Adicione um Produto</h2>
           <div className="space-y-2"><Label htmlFor="title">Nome do Produto</Label><Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Bolo de Chocolate" required /></div>
          <div className="space-y-2"><Label htmlFor="description">Descrição do Produto</Label><Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes do produto..." /></div>
          <div className="space-y-2"><Label htmlFor="price">Preço (R$)</Label><Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="25,00" required /></div>
        </div>
      );
    }
    return null;
  };

  const renderLoanForm = () => {
    if (isFetchingItems) {
        return <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>;
    }
    if (userItems.length === 0) {
        return <div className="text-center py-8 px-4 bg-card rounded-lg border"><p className="text-muted-foreground">Você não possui itens disponíveis para empréstimo. Adicione um item no marketplace como "Doação" ou "Troca" primeiro.</p></div>
    }
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label>Item para Emprestar</Label>
                <Select onValueChange={setSelectedItemId} value={selectedItemId}><SelectTrigger><SelectValue placeholder="Selecione um de seus itens" /></SelectTrigger><SelectContent>{userItems.map(item => (<SelectItem key={item.id} value={item.id}>{item.title}</SelectItem>))}</SelectContent></Select>
            </div>
            <div className="space-y-2"><Label htmlFor="returnDate">Data de Devolução</Label><Input id="returnDate" type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="terms">Termos (Opcional)</Label><Textarea id="terms" value={terms} onChange={e => setTerms(e.target.value)} placeholder="Ex: Devolver nas mesmas condições..." /></div>
        </div>
    );
  };

  const getButtonText = () => {
    if (isLoading) return 'Publicando...';
    if (category === 'store') {
      if (hasStore === false) return 'Criar Loja e Continuar';
      return 'Adicionar Produto';
    }
    if (category === 'loan') return 'Oferecer para Empréstimo';
    return 'Publicar Anúncio';
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Criar Novo Post</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label>Categoria</Label>
          <RadioGroup defaultValue="marketplace" value={category} onValueChange={setCategory} className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2"><RadioGroupItem value="marketplace" id="marketplace" /><Label htmlFor="marketplace">Marketplace</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="store" id="store" /><Label htmlFor="store">Loja/Produto</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="loan" id="loan" /><Label htmlFor="loan">Empréstimo</Label></div>
          </RadioGroup>
        </div>
        
        {category === 'marketplace' && renderMarketplaceForm()}
        {category === 'store' && renderStoreForm()}
        {category === 'loan' && renderLoanForm()}

        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

        <Button type="submit" disabled={isLoading || (category === 'loan' && (isFetchingItems || userItems.length === 0))} className="w-full">{getButtonText()}</Button>
      </form>
    </div>
  );
}
