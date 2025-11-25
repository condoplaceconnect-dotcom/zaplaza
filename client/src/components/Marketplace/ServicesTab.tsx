import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Edit, Trash2, Loader2, Wrench, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CategoryChips from "./CategoryChips";
import { useAuth } from "@/hooks/useAuth";

// 1. Define the data structure for a Service
type ServiceItem = {
  id: string;
  userId: string;
  providerName: string;
  title: string;
  description: string | null;
  category: string;
  pricingType: "fixed" | "hourly";
  price: number;
  status: "active" | "paused" | "removed";
};

// 2. Create a Zod schema for form validation
const serviceFormSchema = z.object({
  title: z.string().min(3, "Título é obrigatório."),
  description: z.string().max(2000, "Descrição muito longa.").optional(),
  category: z.string().min(1, "Categoria é obrigatória."),
  pricingType: z.enum(["fixed", "hourly"], { required_error: "Tipo de preço é obrigatório" }),
  price: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().positive("O preço deve ser positivo.")),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

// Props are the same as ProductsTab
interface ServicesTabProps {
  searchTerm: string;
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function ServicesTab({ searchTerm, selectedCategories, setSelectedCategories }: ServicesTabProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  const form = useForm<ServiceFormValues>({ resolver: zodResolver(serviceFormSchema) });

  // 3. Fetch data from a new endpoint (hypothetical for now)
  const { data: services = [], isLoading } = useQuery<ServiceItem[]>({ 
    queryKey: ["/api/services"], 
    // Placeholder data until backend is ready
    initialData: [], 
  });

  const allCategories = useMemo(() => Array.from(new Set(services.map(s => s.category).filter(Boolean))), [services]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => {
      if (category === "__ALL__") return [];
      return prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category];
    });
  };

  // 4. Filter logic adapted for services
  const filteredServices = useMemo(() => {
    return services.filter(service => {
        const searchMatch = searchTerm.toLowerCase() === '' || 
                              service.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              service.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(service.category);
        return searchMatch && categoryMatch;
    });
  }, [services, searchTerm, selectedCategories]);

  // Mutations would target the /api/services endpoint
  const { mutate: addService } = useMutation({ mutationFn: (data: ServiceFormValues) => apiRequest("POST", "/api/services", data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/services"]}); setIsDialogOpen(false); toast({ description: "Serviço adicionado!" }); } });
  const { mutate: updateService } = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<ServiceFormValues> }) => apiRequest("PATCH", `/api/services/${id}`, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/services"]}); setIsDialogOpen(false); toast({ description: "Serviço atualizado!" }); } });
  const { mutate: deleteService } = useMutation({ mutationFn: (id: string) => apiRequest("DELETE", `/api/services/${id}`), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/services"]}); toast({ description: "Serviço removido!" }); } });

  const onSubmit = (data: ServiceFormValues) => editingService ? updateService({ id: editingService.id, data }) : addService(data);
  const handleEdit = (e: React.MouseEvent, service: ServiceItem) => { e.preventDefault(); e.stopPropagation(); setEditingService(service); form.reset(service); setIsDialogOpen(true); };
  const handleDelete = (e: React.MouseEvent, id: string) => { e.preventDefault(); e.stopPropagation(); if (confirm("Tem certeza?")) deleteService(id); };
  const handleAddNew = () => { setEditingService(null); form.reset(); setIsDialogOpen(true); };

  const getPricingLabel = (type: "fixed" | "hourly") => type === 'fixed' ? 'Preço Fixo' : 'Por Hora';

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;

  return (
    <div>
        <div className="flex justify-between items-center mb-4 flex-wrap">
          <CategoryChips categories={allCategories} selectedCategories={selectedCategories} onCategoryToggle={handleCategoryToggle} />
          <Button onClick={handleAddNew} className="ml-auto whitespace-nowrap"><Plus className="w-4 h-4 mr-2" />Oferecer Serviço</Button>
        </div>

        {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredServices.map((service) => (
                    <Link key={service.id} href={`/marketplace/user/${service.userId}`}>
                        <Card className="h-full flex flex-col justify-between hover:shadow-lg transition-shadow cursor-pointer">
                            <div>
                                <CardHeader>
                                    <CardTitle>{service.title}</CardTitle>
                                    <CardDescription>{service.category}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-lg font-bold text-primary">R$ {service.price.toFixed(2)}</p>
                                    <Badge variant="outline" className="mt-1">{getPricingLabel(service.pricingType)}</Badge>
                                </CardContent>
                            </div>
                            <CardFooter className="flex justify-between items-center text-xs text-muted-foreground pt-4">
                                <div className="flex items-center"><User className="w-3 h-3 mr-1.5" /><span>{service.providerName}</span></div>
                                {user?.id === service.userId && (
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => handleEdit(e, service)}><Edit className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => handleDelete(e, service.id)}><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                )}
                            </CardFooter>
                        </Card>
                    </Link>
                ))}
            </div>
        ) : (
          <Card className="col-span-full border-dashed">
            <CardContent className="py-16 text-center text-muted-foreground">
              <Wrench className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold">Nenhum serviço encontrado</h3>
              <p className="text-sm">Seja o primeiro a oferecer um serviço no seu condomínio!</p>
            </CardContent>
          </Card>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>{editingService ? 'Editar Serviço' : 'Oferecer Serviço'}</DialogTitle></DialogHeader>
                <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField name="title" control={form.control} render={({field}) => <FormItem><FormLabel>Serviço</FormLabel><FormControl><Input {...field} placeholder="Ex: Aula de Violão" /></FormControl></FormItem>} />
                    <FormField name="category" control={form.control} render={({field}) => <FormItem><FormLabel>Categoria</FormLabel><FormControl><Input {...field} placeholder="Ex: Aulas, Reparos, Bem-estar" /></FormControl></FormItem>} />
                    <FormField name="description" control={form.control} render={({field}) => <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>} />
                    <div className="flex gap-4">
                        <FormField name="pricingType" control={form.control} render={({field}) => <FormItem className="flex-1"><FormLabel>Tipo de Preço</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="fixed">Fixo</SelectItem><SelectItem value="hourly">Por Hora</SelectItem></SelectContent></Select></FormItem>} />
                        <FormField name="price" control={form.control} render={({field}) => <FormItem className="flex-1"><FormLabel>Preço (R$)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>} />
                    </div>
                    <DialogFooter><Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button><Button type="submit">{editingService ? 'Salvar' : 'Adicionar'}</Button></DialogFooter>
                </form></Form>
            </DialogContent>
        </Dialog>
    </div>
  );
}
