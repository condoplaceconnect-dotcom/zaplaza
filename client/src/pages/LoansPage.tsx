import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ArrowRightLeft, Handshake, Undo2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Loan } from '@shared/schema';

interface PopulatedLoan extends Loan {
  item: { title: string };
  borrower: { name: string };
  owner: { name: string };
}

export default function LoansPage() {
  const { token } = useAuth();
  const [lentItems, setLentItems] = useState<PopulatedLoan[]>([]);
  const [borrowedItems, setBorrowedItems] = useState<PopulatedLoan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoans = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      setError("Você precisa estar logado para ver seus empréstimos.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/loans/my', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Falha ao buscar empréstimos.');
      const { lent, borrowed } = await response.json();
      setLentItems(lent || []);
      setBorrowedItems(borrowed || []);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const handleStatusUpdate = async (loanId: string, status: 'active' | 'rejected' | 'returned') => {
    setError(null);
    try {
        const response = await fetch(`/api/loans/${loanId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Falha ao atualizar o status.');
        }
        // Refresh the lists
        fetchLoans();
    } catch (err: any) {
        setError(err.message);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const variant = {
        pending: 'secondary',
        active: 'default',
        returned: 'success',
        rejected: 'destructive',
        cancelled: 'destructive'
    }[status] || 'default';
    return <Badge variant={variant as any}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  if (isLoading) {
    return <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto" /> Carregando...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Erro: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-8">
      <h1 className="text-3xl font-bold flex items-center gap-2"><ArrowRightLeft className="w-8 h-8"/>Meus Empréstimos</h1>
      
      {/* LENT ITEMS SECTION */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'><Handshake className='text-primary'/>Itens que Emprestei</CardTitle>
          <CardDescription>Itens seus que estão com outros moradores ou com pedidos pendentes.</CardDescription>
        </CardHeader>
        <CardContent>
          {lentItems.length === 0 ? (
            <p className="text-muted-foreground">Ninguém pegou um item seu emprestado ainda.</p>
          ) : (
            <ul className="divide-y">
              {lentItems.map(loan => (
                <li key={loan.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="font-semibold">{loan.item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Emprestado para: <strong>{loan.borrower.name}</strong> | Devolver até: {new Date(loan.returnDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={loan.status} />
                    {loan.status === 'pending' && (
                      <div className='flex gap-2'>
                        <Button size="sm" onClick={() => handleStatusUpdate(loan.id, 'active')}>Aceitar</Button>
                        <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(loan.id, 'rejected')}>Recusar</Button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* BORROWED ITEMS SECTION */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'><Undo2 className='text-primary'/>Itens que Peguei Emprestado</CardTitle>
           <CardDescription>Itens de outros moradores que você pegou emprestado.</CardDescription>
        </CardHeader>
        <CardContent>
          {borrowedItems.length === 0 ? (
            <p className="text-muted-foreground">Você não pegou nenhum item emprestado.</p>
          ) : (
             <ul className="divide-y">
              {borrowedItems.map(loan => (
                <li key={loan.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                   <div>
                    <p className="font-semibold">{loan.item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Dono(a): <strong>{loan.owner.name}</strong> | Devolver até: {new Date(loan.returnDate).toLocaleDateString()}
                    </p>
                  </div>
                   <div className="flex items-center gap-2">
                    <StatusBadge status={loan.status} />
                    {loan.status === 'active' && (
                      <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(loan.id, 'returned')}>Marcar como Devolvido</Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {error && <p className="text-red-500 text-sm font-medium fixed bottom-4 right-4 bg-background border p-4 rounded-lg shadow-lg">{error}</p>}
    </div>
  );
}
