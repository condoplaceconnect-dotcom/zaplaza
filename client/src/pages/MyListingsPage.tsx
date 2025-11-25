import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Edit, Trash2, Package, Wrench, PackageCheck, PackageX, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";

// --- TYPES & SCHEMAS ---
type MarketplaceItem = { id: string; title: string; description: string | null; category: string | null; type: "sale" | "donation" | "exchange"; price: string | null; status: "available" | "sold" | "reserved" | "removed"; };
type ServiceItem = { id: string; title: string; description: string | null; category: string; pricingType: "fixed" | "hourly"; price: number; status: "active" | "paused" | "removed"; };
type Listing = MarketplaceItem | ServiceItem;

const marketplaceFormSchema = z.object({ title: z.string().min(1), description: z.string().optional(), category: z.string().optional(), type: z.enum(["sale", "donation", "exchange"]), price: z.string().optional() });
const serviceFormSchema = z.object({ title: z.string().min(3), description: z.string().optional(), category: z.string().min(1), pricingType: z.enum(["fixed", "hourly"]), price: z.preprocess(a => parseFloat(z.string().parse(a)), z.number().positive()) });

const ListingCard = ({ item, onEdit, onDelete, onToggleStatus }: { item: Listing, onEdit: (item: Listing) => void, onDelete: (id: string, type: 'product' | 'service') => void, onToggleStatus: (item: Listing) => void}) => {
    const type = 'pricingType' in item ? 'service' : 'product';
    const isAvailable = item.status === 'available' || item.status === 'active';
    const toggleLabel = isAvailable ? (type === 'product' ? 'Marcar como Vendido' : 'Marcar como Indisponível') : (type === 'product' ? 'Marcar como Disponível' : 'Marcar como Ativo');
    const ToggleIcon = isAvailable ? PackageX : PackageCheck;

    return (
        <Card className="flex flex-col justify-between">
            <div>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle>{item.title}</CardTitle>
                        <Badge variant={isAvailable ? "success" : "outline"} className="capitalize">{item.status}</Badge>
                    </div>
                    <CardDescription>{item.category}</CardDescription>
                </CardHeader>
                <CardContent>
                    {'price' in item && item.price && <p className="font-bold text-lg">R$ {parseFloat(String(item.price)).toFixed(2)}</p>}
                </CardContent>
            </div>
            <CardFooter className="flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => onToggleStatus(item)}><ToggleIcon className="w-4 h-4 mr-1"/> {toggleLabel}</Button>
                <Button variant="secondary" size="sm" onClick={() => onEdit(item)}><Edit className="w-4 h-4 mr-1"/> Editar</Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(item.id, type)}><Trash2 className="w-4 h-4 mr-1"/> Remover</Button>
            </CardFooter>
        </Card>
    );
};

export default function MyListingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Listing | null>(null);

    const form = useForm(); // Form instance without resolver initially

    const { data: products = [], isLoading: isLoadingProducts } = useQuery<MarketplaceItem[]>({ queryKey: ['/api/marketplace', { userId: user?.id }], enabled: !!user });
    const { data: services = [], isLoading: isLoadingServices } = useQuery<ServiceItem[]>({ queryKey: ['/api/services', { userId: user?.id }], enabled: !!user, initialData: [] });

    const updateMutation = useMutation(
        ({ id, data, type }: { id: string; data: any; type: 'product' | 'service' }) => apiRequest("PATCH", `/api/${type === 'product' ? 'marketplace' : 'services'}/${id}`, data),
        { onSuccess: () => { queryClient.invalidateQueries(); toast({ description: "Anúncio atualizado!"}); setIsDialogOpen(false); } }
    );
    
    const deleteMutation = useMutation(
        ({ id, type }: { id: string; type: 'product' | 'service' }) => apiRequest("DELETE", `/api/${type === 'product' ? 'marketplace' : 'services'}/${id}`),
        { onSuccess: () => { queryClient.invalidateQueries(); toast({ description: "Anúncio removido!" }); } }
    );

    const handleEdit = (item: Listing) => {
        const type = 'pricingType' in item ? 'service' : 'product';
        form.reset(item);
        form.resolver = zodResolver(type === 'product' ? marketplaceFormSchema : serviceFormSchema);
        setEditingItem(item);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string, type: 'product' | 'service') => {
        if (confirm("Tem certeza que deseja remover este anúncio?")) {
            deleteMutation.mutate({ id, type });
        }
    };
    
    const handleToggleStatus = (item: Listing) => {
        const type = 'pricingType' in item ? 'service' : 'product';
        const isAvailable = item.status === 'available' || item.status === 'active';
        const newStatus = type === 'product' ? (isAvailable ? 'sold' : 'available') : (isAvailable ? 'paused' : 'active');
        updateMutation.mutate({ id: item.id, data: { status: newStatus }, type });
    };

    const onSubmit = (data: any) => {
        if (!editingItem) return;
        const type = 'pricingType' in editingItem ? 'service' : 'product';
        updateMutation.mutate({ id: editingItem.id, data, type });
    };

    const isLoading = isLoadingProducts || isLoadingServices;

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Meus Anúncios</h1>
                <p className="text-muted-foreground">Gerencie seus produtos e serviços oferecidos no marketplace.</p>
            </div>
            {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin"/></div> : 
                <Tabs defaultValue="products">
                    <TabsList className="grid w-full grid-cols-2 max-w-lg mb-6">
                        <TabsTrigger value="products"><Package className="w-4 h-4 mr-2"/>Produtos ({products.length})</TabsTrigger>
                        <TabsTrigger value="services"><Wrench className="w-4 h-4 mr-2"/>Serviços ({services.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="products"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{products.map(item => <ListingCard key={item.id} item={item} onEdit={handleEdit} onDelete={handleDelete} onToggleStatus={handleToggleStatus}/>)}</div></TabsContent>
                    <TabsContent value="services"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{services.map(item => <ListingCard key={item.id} item={item} onEdit={handleEdit} onDelete={handleDelete} onToggleStatus={handleToggleStatus}/>)}</div></TabsContent>
                </Tabs>
            }
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Editar Anúncio</DialogTitle></DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* Render form fields based on editingItem type */}
                            {editingItem && ('pricingType' in editingItem ? (
                                <> {/* Service Fields */}
                                    <FormField name="title" control={form.control} render={({field}) => <FormItem><FormLabel>Serviço</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
                                    <FormField name="category" control={form.control} render={({field}) => <FormItem><FormLabel>Categoria</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
                                </> 
                            ) : (
                                <> {/* Product Fields */}
                                    <FormField name="title" control={form.control} render={({field}) => <FormItem><FormLabel>Produto</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
                                    <FormField name="type" control={form.control} render={({field}) => <FormItem><FormLabel>Tipo</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="sale">Venda</SelectItem><SelectItem value="donation">Doação</SelectItem><SelectItem value="exchange">Troca</SelectItem></SelectContent></Select></FormItem>} />
                                </> 
                            ))}
                            <DialogFooter><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button><Button type="submit">Salvar</Button></DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
