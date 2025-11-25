import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import type { Report } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Info } from 'lucide-react';

const fetchReports = async () => {
    const res = await apiRequest('GET', '/api/admin/my-condo/reports');
    if (!res.ok) {
        const errorText = await res.text();
        console.error("Failed to fetch reports:", errorText);
        throw new Error('Não foi possível carregar as denúncias. Tente novamente mais tarde.');
    }
    return res.json();
};

const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'resolved':
      return 'default'; // Verde
    case 'under_review':
      return 'secondary'; // Azul
    case 'dismissed':
      return 'outline'; // Cinza
    case 'pending':
      return 'destructive'; // Amarelo/Vermelho
    default:
      return 'outline';
  }
}

const ReportsPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: reports, isLoading, isError, error } = useQuery<Report[], Error>({ 
    queryKey: ['adminReports'], 
    queryFn: fetchReports,
    onError: (err) => {
        toast({
            title: "Erro ao Carregar Denúncias",
            description: err.message,
            variant: "destructive",
        });
    }
  });

  const handleRowClick = (id: string) => {
    setLocation(`/admin/reports/${id}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Denúncias</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Carregando denúncias...</p>}
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
                <TableHead>Data</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Alvo da Denúncia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports && reports.length > 0 ? (
                reports.map((report) => (
                  <TableRow key={report.id} onClick={() => handleRowClick(report.id)} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{report.reason}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(report.status)}>
                        {report.status.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{`${report.targetType}: ${report.targetId.substring(0, 8)}...`}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Nenhuma Denúncia Encontrada</AlertTitle>
                        <AlertDescription>
                            Não há denúncias pendentes ou registradas para este condomínio no momento.
                        </AlertDescription>
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

export default ReportsPage;
