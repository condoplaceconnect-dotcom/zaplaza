import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, AlertCircle } from 'lucide-react';
import type { MarketplaceItem } from '@shared/schema';

export default function MarketplaceFeed() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setError('Authentication required');
      return;
    }

    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/marketplace', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch marketplace items');
        }
        const data = await response.json();
        setItems(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [token]);

  const formatPrice = (price: string | number | null | undefined) => {
    if (price === null || price === undefined) return null;
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numericPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-10 w-10 mx-auto text-red-500 mb-2" />
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Achadinhos do Condomínio</h1>
      {items.length === 0 ? (
        <div className="text-center py-16 px-6 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold text-muted-foreground">Nenhum item encontrado.</h2>
          <p className="text-muted-foreground mt-2">Que tal ser o primeiro a anunciar algo?</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map(item => (
            <Card key={item.id} className="overflow-hidden flex flex-col">
              <CardHeader className="p-0">
                <img src={item.imageUrl || 'https://via.placeholder.com/300'} alt={item.title} className="w-full h-48 object-cover" />
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="text-lg mb-2 truncate">{item.title}</CardTitle>
                <p className="text-sm text-muted-foreground h-10 overflow-hidden">{item.description}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <div>
                  <Badge variant={item.type === 'donation' ? 'secondary' : 'default'}>
                    {item.type === 'donation' ? 'Doação' : formatPrice(item.price)}
                  </Badge>
                </div>
                 <Button size="sm" asChild>
                    <Link to={`/marketplace/${item.id}`}>Ver</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      {/* Floating Action Button */}
      <Link to="/create-post">
        <Button
          className="fixed bottom-24 right-6 h-16 w-16 rounded-full shadow-lg flex items-center justify-center"
          aria-label="Create new post"
        >
          <Plus className="h-8 w-8" />
        </Button>
      </Link>
    </div>
  );
}
