import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Condominium } from '@shared/schema';
import { useToast } from "@/hooks/use-toast";

// UI Components
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const fetchPendingCondos = async (): Promise<Condominium[]> => {
    const res = await apiRequest('GET', '/api/admin/condominiums/pending');
    return res.json();
};

const updateCondoStatus = async ({ id, status }: { id: string, status: 'approved' | 'rejected' }) => {
    const res = await apiRequest('PATCH', `/api/admin/condominiums/${id}/status`, { status });
    return res.json();
};

const CondoApprovalPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: pendingCondos, isLoading, isError, error } = useQuery<Condominium[], Error>({
    queryKey: ['pendingCondos'],
    queryFn: fetchPendingCondos,
  });

  const mutation = useMutation(updateCondoStatus, {
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['pendingCondos']);
      toast({ 
        title: "Sucesso!",
        description: `Condomínio ${variables.status === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso.`,
      });
    },
    onError: (err: any) => {
      toast({
        title: "Erro!",
        description: err.message || "Falha ao atualizar o status do condomínio.",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (id: string, status: 'approved' | 'rejected') => {
    mutation.mutate({ id, status });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aprovação de Novos Condomínios</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Carregando condomínios pendentes...</p>}
        {isError && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Erro de Conexão</AlertTitle>
                <AlertDescription>{error?.message}</AlertDescription>
            </Alert>
        )}
        {!isLoading && !isError && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Solicitado em</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingCondos && pendingCondos.length > 0 ? (
                  pendingCondos.map((condo) => (
                    <TableRow key={condo.id}>
                      <TableCell className="font-medium">{condo.name}</TableCell>
                      <TableCell>{`${condo.address}, ${condo.city}`}</TableCell>
                      <TableCell>{new Date(condo.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell><Badge variant="secondary">{condo.status}</Badge></TableCell>
                      <TableCell className="text-right space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleStatusUpdate(condo.id, 'approved')} disabled={mutation.isLoading}>
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Aprovar</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleStatusUpdate(condo.id, 'rejected')} disabled={mutation.isLoading}>
                                <XCircle className="h-5 w-5 text-red-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Rejeitar</p></TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">
                            <Alert className="max-w-md mx-auto">
                                <Info className="h-4 w-4" />
                                <AlertTitle>Tudo Certo por Aqui!</AlertTitle>
                                <AlertDescription>Nenhum condomínio aguardando aprovação no momento.</AlertDescription>
                            </Alert>
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default CondoApprovalPage;
