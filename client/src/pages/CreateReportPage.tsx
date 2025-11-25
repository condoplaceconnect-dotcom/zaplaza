import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest } from '@/lib/queryClient';
import { insertReportSchema, type InsertReport } from '@shared/schema';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const reportTargetTypes = ["user", "store", "product", "marketplace_item", "general"] as const;
const reportReasons = ["spam", "abuse", "violence", "inappropriate", "other"] as const;

const submitReport = async (data: InsertReport) => {
  const res = await apiRequest('POST', '/api/reports', data);
  return res.json();
};

const CreateReportPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<InsertReport>({
    resolver: zodResolver(insertReportSchema),
    defaultValues: {
      targetType: 'general', // Default value
      targetId: '',
      reason: 'other',
      description: '',
    },
  });

  const mutation = useMutation(submitReport, {
    onSuccess: (data, variables, context: any) => {
        const successMessage = context?.status === 202 
            ? 'Sua solicitação foi enviada ao seu responsável para análise.'
            : 'Denúncia enviada com sucesso!';
        toast({ title: "Sucesso", description: successMessage });
        setLocation('/');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Falha ao enviar denúncia. Tente novamente.';
      toast({ title: "Erro", description: errorMessage, variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertReport) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader>
          <CardTitle>Criar Nova Denúncia</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="targetType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Alvo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {reportTargetTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID do Alvo</FormLabel>
                    <FormControl><Input {...field} placeholder="ex: user-123, product-abc" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            {reportReasons.map(reason => <SelectItem key={reason} value={reason}>{reason}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (Opcional)</FormLabel>
                    <FormControl><Textarea {...field} placeholder="Forneça mais detalhes..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={mutation.isLoading} className="w-full">
                {mutation.isLoading ? 'Enviando...' : 'Enviar Denúncia'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateReportPage;
