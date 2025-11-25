import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ArrowRightLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoanItem } from '@/components/LoanItem'; // We will create this component next

// Mirroring the backend response structure
interface LoanDetails {
  id: string;
  status: string;
  agreedReturnDate: string;
  request: {
    title: string;
  };
  borrower: { name: string; };
  owner: { name: string; };
}

export default function MyLoansPage() {
  const { token } = useAuth();
  const [lentItems, setLentItems] = useState<LoanDetails[]>([]);
  const [borrowedItems, setBorrowedItems] = useState<LoanDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoans = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/my-loans', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Falha ao buscar empréstimos.');
      const { lent, borrowed } = await response.json();
      setLentItems(lent);
      setBorrowedItems(borrowed);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [token]);

  // This function will be passed down to LoanItem to refresh the list after an action
  const handleUpdate = () => {
    fetchLoans(); 
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center mb-6">
        <ArrowRightLeft className="h-6 w-6 mr-3" />
        <h1 className="text-2xl font-bold">Meus Empréstimos</h1>
      </div>

      <Tabs defaultValue="borrowed">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="borrowed">Peguei Emprestado</TabsTrigger>
          <TabsTrigger value="lent">Emprestei</TabsTrigger>
        </TabsList>
        
        <TabsContent value="borrowed">
          <LoanList items={borrowedItems} perspective="borrower" onUpdate={handleUpdate} />
        </TabsContent>
        
        <TabsContent value="lent">
          <LoanList items={lentItems} perspective="owner" onUpdate={handleUpdate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface LoanListProps {
  items: LoanDetails[];
  perspective: 'borrower' | 'owner';
  onUpdate: () => void;
}

function LoanList({ items, perspective, onUpdate }: LoanListProps) {
  if (items.length === 0) {
    return <p className="text-center text-muted-foreground py-8">Nenhum item encontrado nesta categoria.</p>;
  }
  return (
    <div className="space-y-4 mt-4">
      {items.map(item => (
        <LoanItem key={item.id} item={item} perspective={perspective} onUpdate={onUpdate} />
      ))}
    </div>
  );
}
