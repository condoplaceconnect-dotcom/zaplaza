import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Supondo que a API retorne itens com esta estrutura
interface MarketplaceItem {
  id: string;
  title: string;
  description: string | null;
  price: string | null;
  type: 'sale' | 'donation' | 'exchange';
  createdAt: string;
}

export default function MarketplaceTab() {
  const { token } = useAuth();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketplaceItems = async () => {
      if (!token) {
        setIsLoading(false);
        setError("Você precisa estar logado para ver os itens.");
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch('/api/marketplace', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar os itens do marketplace.');
        }

        const data: MarketplaceItem[] = await response.json();
        setItems(data);

      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro inesperado.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketplaceItems();
  }, [token]);

  const formatPrice = (price: string | null, type: string) => {
    if (type === 'donation') return "Doação";
    if (type === 'exchange') return "Troca";
    if (price) {
      const priceNumber = parseFloat(price);
      return `R$ ${priceNumber.toFixed(2).replace('.', ',')}`;
    }
    return "Preço a combinar";
  };

  const getTypeLabel = (type: string) => {
      switch(type) {
          case 'sale': return 'Venda';
          case 'donation': return 'Doação';
          case 'exchange': return 'Troca';
          default: return ''
      }
  }

  if (isLoading) {
    return <p className="text-center text-muted-foreground py-12">Carregando itens...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 py-12">{error}</p>;
  }

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
            <p className="text-muted-foreground">Nenhum item encontrado no marketplace ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground text-sm line-clamp-3">{
                    item.description || "Nenhuma descrição fornecida."
                }</p>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <span className="font-bold text-primary">{formatPrice(item.price, item.type)}</span>
                <Badge variant="secondary">{getTypeLabel(item.type)}</Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
