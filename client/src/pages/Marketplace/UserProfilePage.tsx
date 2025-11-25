import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, PackageSearch, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

// Basic type for user public profile
type UserProfile = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

// Reusing the MarketplaceItem type from ProductsTab
type MarketplaceItem = { id: string; title: string; description: string | null; price: string | null; type: "sale" | "donation" | "exchange"; category: string | null; };

export default function UserProfilePage() {
  const [, params] = useRoute("/marketplace/user/:userId");
  const userId = params?.userId;

  // Query for the user's public profile
  const { data: user, isLoading: isLoadingUser } = useQuery<UserProfile>({
    queryKey: [`/api/users/${userId}/profile`],
    enabled: !!userId,
  });

  // Query for the items this user is selling
  const { data: items, isLoading: isLoadingItems } = useQuery<MarketplaceItem[]>({
    queryKey: [`/api/marketplace?userId=${userId}`],
    enabled: !!userId,
  });

  const isLoading = isLoadingUser || isLoadingItems;

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return <div className="text-center py-20">Usuário não encontrado.</div>;
  }

  const getTypeLabel = (type: string) => ({ sale: "Venda", donation: "Doação", exchange: "Troca" }[type] || type);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Link href="/marketplace" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para o Marketplace
      </Link>

      <div className="flex items-center space-x-4 mb-8">
        <Avatar className="h-20 w-20 border-2 border-primary">
          <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">Itens à venda no marketplace</p>
        </div>
      </div>

      {items && items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <Card key={item.id}>
               <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{getTypeLabel(item.type)}</CardDescription>
              </CardHeader>
              <CardContent>
                {item.type === 'sale' && item.price && (
                  <p className="text-lg font-bold text-primary">R$ {parseFloat(item.price).toFixed(2)}</p>
                )}
                <p className="text-sm text-muted-foreground mt-2">{item.description || "Sem descrição."}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            <PackageSearch className="mx-auto h-12 w-12 mb-4" />
            <h3 className="text-lg font-semibold">Nenhum item encontrado</h3>
            <p className="text-sm">Este usuário não tem itens à venda no momento.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
