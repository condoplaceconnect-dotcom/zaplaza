import { useRoute } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { type Report, updateReportSchema } from '@shared/schema';
import { useToast } from "@/hooks/use-toast";

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

// Zod schema for the form
const formSchema = updateReportSchema;

type FormValues = z.infer<typeof formSchema>;

const fetchReport = async (id: string): Promise<Report> => {
  const res = await apiRequest('GET', `/api/admin/reports/${id}`);
  return res.json();
};

const updateReport = async ({ id, data }: { id: string, data: FormValues }): Promise<Report> => {
  const res = await apiRequest('PATCH', `/api/admin/reports/${id}`, data);
  return res.json();
};

function ReportDetailsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, params] = useRoute('/admin/reports/:id');
  const reportId = params?.id ?? '';

  const { data: report, isLoading, isError, error } = useQuery<Report, Error>({
    queryKey: ['report', reportId],
    queryFn: () => fetchReport(reportId),
    enabled: !!reportId,
  });

  const mutation = useMutation(updateReport, {
    onSuccess: (data) => {
      queryClient.setQueryData(['report', reportId], data);
      queryClient.invalidateQueries(['adminReports']);
      toast({ title: "Sucesso", description: "Denúncia atualizada com sucesso!" });
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err.message || 'Falha ao atualizar a denúncia.', variant: "destructive" });
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: {
        status: report?.status ?? 'pending',
        adminNotes: report?.adminNotes ?? '',
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate({ id: reportId, data });
  };

  if (isLoading) return <div>Carregando denúncia...</div>;
  if (isError) return (
    <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro ao Carregar Denúncia</AlertTitle>
        <AlertDescription>{error?.message}</AlertDescription>
    </Alert>
  );
  if (!report) return <div>Denúncia não encontrada.</div>;

  return (
    <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Detalhes da Denúncia</CardTitle>
                <CardDescription>ID: {report.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p><strong>Motivo:</strong> {report.reason}</p>
                <p><strong>Descrição:</strong> {report.description}</p>
                <p><strong>Data:</strong> {new Date(report.createdAt).toLocaleString()}</p>
                <p><strong>Status Atual:</strong> <Badge>{report.status}</Badge></p>
                <p><strong>Reportado por:</strong> {report.reporterId}</p>
                <p><strong>Alvo:</strong> {report.targetType} - {report.targetId}</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Ações do Administrador</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Atualizar Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="pending">Pendente</SelectItem>
                                            <SelectItem value="under_review">Em Análise</SelectItem>
                                            <SelectItem value="resolved">Resolvido</SelectItem>
                                            <SelectItem value="dismissed">Dispensado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="adminNotes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notas Administrativas</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} rows={5} placeholder="Adicione suas notas aqui..." />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={mutation.isLoading}>
                            {mutation.isLoading ? 'Atualizando...' : 'Salvar Alterações'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}

export default ReportDetailsPage;
