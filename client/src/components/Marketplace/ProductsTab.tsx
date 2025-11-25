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
import { Plus, Edit, Trash2, Loader2, PackageSearch, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CategoryChips from "./CategoryChips";
import { useAuth } from "@/hooks/useAuth";

type MarketplaceItem = {
  id: string;
  userId: string;
  sellerName: string; 
  title: string;
  description: string | null;
  category: string | null;
  type: "sale" | "donation" | "exchange";
  price: string | null;
  status: "available" | "sold" | "reserved" | "removed";
};

const marketplaceFormSchema = z.object({ 
    title: z.string().min(1, "Título é obrigatório"),
    description: z.string().max(2000).optional(),
    category: z.string().max(100).optional(),
    type: z.enum(["sale", "donation", "exchange"]),
    price: z.string().optional(),
}).refine(data => data.type !== "sale" || (!!data.price && parseFloat(data.price) > 0), { message: "Preço é obrigatório para vendas", path: ["price"] });

type MarketplaceFormValues = z.infer<typeof marketplaceFormSchema>;

interface ProductsTabProps {
  searchTerm: string;
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function ProductsTab({ searchTerm, selectedCategories, setSelectedCategories }: ProductsTabProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MarketplaceItem | null>(null);

  const form = useForm<MarketplaceFormValues>({ resolver: zodResolver(marketplaceFormSchema), defaultValues: { title: "", description: "", category: "", type: "sale", price: "" } });

  const { data: items = [], isLoading } = useQuery<MarketplaceItem[]>({ queryKey: ["/api/marketplace"] });

  const allCategories = useMemo(() => Array.from(new Set(items.map(i => i.category).filter(Boolean) as string[])), [items]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => {
      if (category === "__ALL__") return [];
      return prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category];
    });
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
        const searchMatch = searchTerm.toLowerCase() === '' || 
                              item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              item.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const categoryMatch = selectedCategories.length === 0 || (item.category && selectedCategories.includes(item.category));
        return searchMatch && categoryMatch;
    });
  }, [items, searchTerm, selectedCategories]);

  const { mutate: addItem } = useMutation({ mutationFn: (data: MarketplaceFormValues) => apiRequest("POST", "/api/marketplace", data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/marketplace"]}); setIsDialogOpen(false); form.reset(); toast({ description: "Item adicionado!" }); } });
  const { mutate: updateItem } = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<MarketplaceFormValues> }) => apiRequest("PATCH", `/api/marketplace/${id}`, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/marketplace"]}); setIsDialogOpen(false); form.reset(); toast({ description: "Item atualizado!" }); } });
  const { mutate: deleteItem } = useMutation({ mutationFn: (id: string) => apiRequest("DELETE", `/api/marketplace/${id}`), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/marketplace"]}); toast({ description: "Item removido!" }); } });

  const onSubmit = (data: MarketplaceFormValues) => editingItem ? updateItem({ id: editingItem.id, data }) : addItem(data);
  const handleEdit = (e: React.MouseEvent, item: MarketplaceItem) => { e.preventDefault(); e.stopPropagation(); setEditingItem(item); form.reset({ ...item, description: item.description || '', price: item.price || '' }); setIsDialogOpen(true); };
  const handleDelete = (e: React.MouseEvent, id: string) => { e.preventDefault(); e.stopPropagation(); if (confirm("Tem certeza?")) deleteItem(id); };
  const handleAddNew = () => { setEditingItem(null); form.reset(); setIsDialogOpen(true); };

  const getTypeLabel = (type: string) => ({ sale: "Venda", donation: "Doação", exchange: "Troca" }[type] || type);

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap">
          <CategoryChips categories={allCategories} selectedCategories={selectedCategories} onCategoryToggle={handleCategoryToggle} />
          <Button onClick={handleAddNew} className="ml-auto whitespace-nowrap"><Plus className="w-4 h-4 mr-2" />Adicionar Item</Button>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <Link key={item.id} href={`/marketplace/user/${item.userId}`}>
              <Card className="h-full flex flex-col justify-between hover:shadow-lg transition-shadow cursor-pointer">
                <div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
                      <Badge variant={item.type === "sale" ? "default" : "secondary"}>{getTypeLabel(item.type)}</Badge>
                    </div>
                    {item.type === "sale" && item.price && <p className="text-xl font-bold text-primary pt-1">R$ {parseFloat(item.price).toFixed(2)}</p>}
                  </CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground line-clamp-2">{item.description || "Sem descrição"}</p></CardContent>
                </div>
                <CardFooter className="flex justify-between items-center text-xs text-muted-foreground pt-4">
                    <div className="flex items-center">
                        <User className="w-3 h-3 mr-1.5" />
                        <span>{item.sellerName || 'Vendedor'}</span>
                    </div>
                    {user?.id === item.userId && (
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => handleEdit(e, item)}><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => handleDelete(e, item.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    )}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="col-span-full border-dashed"><CardContent className="py-16 text-center text-muted-foreground"><PackageSearch className="mx-auto h-12 w-12 mb-4" /><h3 className="text-lg font-semibold">Nenhum item encontrado</h3><p className="text-sm">Tente ajustar sua busca ou filtros.</p></CardContent></Card>
      )}

    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar Item" : "Adicionar Item"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <FormField name="title" control={form.control} render={({ field }) => (
                  <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                  </FormItem>
              )} />

              <FormField name="description" control={form.control} render={({ field }) => (
                  <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl><Textarea {...field} /></FormControl>
                  </FormItem>
              )} />

              <FormField name="type" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sale">Venda</SelectItem>
                      <SelectItem value="donation">Doação</SelectItem>
                      <SelectItem value="exchange">Troca</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />

              <FormField name="category" control={form.control} render={({ field }) => (
                  <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <FormControl><Input {...field} placeholder="Ex: Móveis, Eletrônicos..." /></FormControl>
                  </FormItem>
              )} />

              {form.watch("type") === 'sale' && (
                <FormField name="price" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Preço</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingItem ? 'Salvar' : 'Adicionar'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
