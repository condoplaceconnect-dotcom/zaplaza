import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string;
}

interface Store {
  id: string;
  name: string;
  description: string | null;
  products: Product[];
}

export default function StoreTab() {
  const { token } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoresAndProducts = async () => {
      if (!token) {
        setError("Autenticação necessária.");
        setIsLoading(false);
        return;
      }

      try {
        // 1. Fetch all stores
        const storesResponse = await fetch('/api/stores', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!storesResponse.ok) throw new Error('Falha ao buscar lojas.');
        const storesData = await storesResponse.json();

        if (storesData.length === 0) {
          setStores([]);
          return;
        }

        // 2. Fetch products for each store
        const storesWithProducts = await Promise.all(
          storesData.map(async (store: any) => {
            const productsResponse = await fetch(`/api/products/store/${store.id}`, {
              headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!productsResponse.ok) {
              console.warn(`Falha ao buscar produtos para a loja: ${store.name}`);
              return { ...store, products: [] }; // Return store even if products fail
            }
            const products = await productsResponse.json();
            return { ...store, products };
          })
        );

        setStores(storesWithProducts);

      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro inesperado.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoresAndProducts();
  }, [token]);

  const formatPrice = (price: string) => {
    const priceNumber = parseFloat(price);
    return `R$ ${priceNumber.toFixed(2).replace('.', ',')}`;
  };

  if (isLoading) {
    return <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto" /><p className="text-muted-foreground mt-2">Carregando lojas...</p></div>;
  }

  if (error) {
    return <p className="text-center text-red-500 py-12">{error}</p>;
  }

  return (
    <div className="space-y-6">
      {stores.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <p className="text-muted-foreground">Nenhuma loja encontrada neste condomínio ainda.</p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {stores.map((store) => (
            <AccordionItem value={store.id} key={store.id}>
              <AccordionTrigger>
                <div className="flex flex-col items-start text-left">
                  <h3 className="text-lg font-semibold">{store.name}</h3>
                  {store.description && <p className="text-sm text-muted-foreground">{store.description}</p>}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {store.products.length === 0 ? (
                  <p className="text-muted-foreground px-4 py-2">Esta loja ainda não tem produtos.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
                    {store.products.map((product) => (
                      <Card key={product.id}>
                        <CardHeader>
                          <CardTitle className="text-base">{product.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">{product.description || 'Sem descrição'}</p>
                          <p className="font-bold text-lg mt-2">{formatPrice(product.price)}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
