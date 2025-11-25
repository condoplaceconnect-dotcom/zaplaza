import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ImageUp } from 'lucide-react';

export default function CreatePostPage() {
  const [, setLocation] = useLocation();
  const { token } = useAuth();

  // General State
  const [category, setCategory] = useState('marketplace');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Publicando...');

  // Form Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  
  // Image Upload State - ADDED
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Marketplace State
  const [marketplaceType, setMarketplaceType] = useState('sale');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const postData = async (url: string, body: string, redirect = true, redirectPath = '/home') => {
    // This function will now be called by the specific handlers after image upload
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Falha ao enviar dados para ${url}`)
      }
      if (redirect) {
        setLocation(redirectPath);
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
      return false;
    } 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    switch (category) {
      case 'marketplace':
        await handleCreateMarketplaceItem();
        break;
      case 'loan':
        await handleCreateLoanRequest();
        break;
      // Other categories can be added here
    }
    
    setIsLoading(false);
  };
  
  // REWRITTEN to handle image upload
  const handleCreateMarketplaceItem = async () => {
    let imageUrl = '';

    if (imageBase64) {
      setLoadingText('Enviando imagem...');
      try {
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ image: imageBase64 }),
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Falha no upload da imagem.');
        }

        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.imageUrl;
      } catch (err: any) {
        setError(err.message);
        return; // Stop execution if upload fails
      }
    }

    setLoadingText('Finalizando anúncio...');
    const body = JSON.stringify({
      title,
      description,
      price: marketplaceType === 'sale' ? parseFloat(price) || null : null,
      type: marketplaceType,
      category: 'general', // This can be dynamic in the future
      imageUrl: imageUrl, // The URL from the upload
    });

    await postData('/api/marketplace', body, true, '/marketplace');
  };

  const handleCreateLoanRequest = async () => {
     if (!title) {
      setError('Por favor, informe o que você precisa.');
      return;
    }
    setLoadingText('Criando pedido...');
    const body = JSON.stringify({ title, description });
    await postData('/api/loan-requests', body, true, '/loan-requests-feed');
  };


  // REWRITTEN to include all fields and image upload
  const renderMarketplaceForm = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-2">
        <Label>Tipo de Anúncio</Label>
        <RadioGroup value={marketplaceType} onValueChange={setMarketplaceType} className="flex gap-4">
          <div className="flex items-center space-x-2"><RadioGroupItem value="sale" id="sale" /><Label htmlFor="sale">Venda</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="donation" id="donation" /><Label htmlFor="donation">Doação</Label></div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="itemTitle">Título do Anúncio</Label>
        <Input id="itemTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Cadeira de escritório ergonômica" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="itemDescription">Descrição (Opcional)</Label>
        <Textarea id="itemDescription" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes sobre o produto, estado, etc." />
      </div>

      {marketplaceType === 'sale' && (
        <div className="space-y-2">
          <Label htmlFor="itemPrice">Preço (R$)</Label>
          <Input id="itemPrice" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="150,00" required />
        </div>
      )}
      
      <div className="space-y-3">
        <Label htmlFor="itemImage">Foto do Item (Opcional)</Label>
        {imagePreview ? (
          <div className='relative w-full max-w-xs mx-auto'>
            <img src={imagePreview} alt="Pré-visualização" className="w-full h-auto rounded-lg shadow-md" />
            <Button variant='destructive' size='sm' onClick={() => { setImagePreview(null); setImageBase64(null); }} className='absolute top-2 right-2'>Remover</Button>
          </div>
        ) : (
            <Label htmlFor="itemImage" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                <ImageUp className="w-10 h-10 text-muted-foreground" />
                <span className='text-sm text-muted-foreground mt-2'>Clique para escolher uma imagem</span>
            </Label>
        )}
        <Input id="itemImage" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
      </div>

    </div>
  );

  const renderLoanForm = () => (
     <div className="space-y-6 animate-in fade-in duration-300">
        <div className="space-y-2">
            <Label htmlFor="loanTitle">O que você precisa emprestado?</Label>
            <Input id="loanTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Uma furadeira de impacto para um furo na parede" required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="loanDescription">Mais detalhes (Opcional)</Label>
            <Textarea id="loanDescription" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Por quanto tempo precisa, características específicas, etc." />
        </div>
    </div>
  );

  const getButtonText = () => {
    if (isLoading) return loadingText;
    if (category === 'loan') return 'Criar Pedido de Empréstimo';
    return 'Publicar Anúncio no Marketplace';
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Criar um Post</h1>
      <div className="bg-card p-6 rounded-xl shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label className='text-lg'>Qual o tipo de post?</Label>
            <RadioGroup defaultValue="marketplace" value={category} onValueChange={setCategory} className="grid grid-cols-2 gap-4">
                <Label htmlFor='marketplace' className={`p-4 border rounded-lg cursor-pointer text-center font-semibold ${category === 'marketplace' ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent'}`}>Marketplace</Label>
                <RadioGroupItem value="marketplace" id="marketplace" className='hidden' />
                <Label htmlFor='loan' className={`p-4 border rounded-lg cursor-pointer text-center font-semibold ${category === 'loan' ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent'}`}>Pedido de Empréstimo</Label>
                <RadioGroupItem value="loan" id="loan" className='hidden' />
            </RadioGroup>
          </div>
          
          {category === 'marketplace' && renderMarketplaceForm()}
          {category === 'loan' && renderLoanForm()}

          {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

          <Button type="submit" disabled={isLoading} className="w-full text-lg py-6">
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />} 
            {getButtonText()}
          </Button>
        </form>
      </div>
    </div>
  );
}
