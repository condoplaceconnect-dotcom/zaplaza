import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Loader2, Store, User } from 'lucide-react';

// 1. Define the data structure for a Seller Profile
type SellerProfile = {
  id: string;
  name: string;
  avatarUrl: string | null;
  itemCount: number; // Number of items/services offered
};

interface StoresTabProps {
  searchTerm: string;
}

export default function StoresTab({ searchTerm }: StoresTabProps) {
  // 2. Fetch data from a new endpoint for sellers
  const { data: sellers = [], isLoading } = useQuery<SellerProfile[]>({
    queryKey: ['/api/marketplace/sellers'],
    // Using placeholder data until the backend is ready
    initialData: [], 
  });

  // 3. Filter logic for sellers based on the search term
  const filteredSellers = useMemo(() => {
    return sellers.filter(seller =>
      seller.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sellers, searchTerm]);

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      {filteredSellers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* 4. Display seller profiles as clickable cards */}
          {filteredSellers.map(seller => (
            <Link key={seller.id} href={`/marketplace/user/${seller.id}`}>
              <Card className="h-full flex flex-col items-center justify-center text-center p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <Avatar className="h-20 w-20 mb-4 border-2 border-muted">
                  <AvatarImage src={seller.avatarUrl || undefined} alt={seller.name} />
                  <AvatarFallback><User className="w-8 h-8" /></AvatarFallback>
                </Avatar>
                <CardHeader className="p-0">
                  <CardTitle className="text-lg">{seller.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-1">
                  <CardDescription>{seller.itemCount} {seller.itemCount > 1 ? 'itens à venda' : 'item à venda'}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="col-span-full border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Store className="mx-auto h-12 w-12 mb-4" />
            <h3 className="text-lg font-semibold">Nenhuma loja ou vendedor encontrado</h3>
            <p className="text-sm">Quando seus vizinhos começarem a vender, eles aparecerão aqui.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
