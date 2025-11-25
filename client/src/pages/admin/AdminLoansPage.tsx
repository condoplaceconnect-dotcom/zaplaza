import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';

interface AdminLoan {
  id: string;
  status: string;
  createdAt: string;
  agreedReturnDate: string;
  request: { title: string; };
  borrower: { name: string; block: string, unit: string };
  owner: { name: string; block: string, unit: string };
}

export default function AdminLoansPage() {
  const { user, token } = useAuth();
  const [loans, setLoans] = useState<AdminLoan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      setError("Acesso negado. Você precisa ser um administrador.");
      setIsLoading(false);
      return;
    }

    const fetchLoans = async () => {
      if (!token) return;
      try {
        const response = await fetch('/api/admin/loans', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Falha ao buscar empréstimos para administração.');
        const data = await response.json();
        setLoans(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoans();
  }, [token, user]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
        <div className="flex items-center mb-6">
            <ShieldCheck className="h-6 w-6 mr-3" />
            <h1 className="text-2xl font-bold">Painel de Administração de Empréstimos</h1>
        </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Mutuário (Pegou Emprestado)</TableHead>
              <TableHead>Dono (Emprestou)</TableHead>
              <TableHead>Data Devolução</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.length > 0 ? (
              loans.map(loan => (
                <TableRow key={loan.id}>
                  <TableCell><Badge variant={loan.status === 'disputed' ? 'destructive' : 'secondary'}>{loan.status}</Badge></TableCell>
                  <TableCell className="font-medium">{loan.request.title}</TableCell>
                  <TableCell>{loan.borrower.name} ({loan.borrower.block}-{loan.borrower.unit})</TableCell>
                  <TableCell>{loan.owner.name} ({loan.owner.block}-{loan.owner.unit})</TableCell>
                  <TableCell>{new Date(loan.agreedReturnDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">Ver Detalhes</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">Nenhum empréstimo registrado no condomínio ainda.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
