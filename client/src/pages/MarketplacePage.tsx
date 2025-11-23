import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Edit, Trash2, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type MarketplaceItem = {
  id: string;
  condoId: string;
  userId: string;
  title: string;
  description: string | null;
  images: string[] | null;
  category: string | null;
  type: "sale" | "donation" | "exchange";
  price: string | null;
  block: string | null;
  unit: string | null;
  status: "available" | "sold" | "reserved" | "removed";
  views: number;
  createdAt: Date;
  updatedAt: Date;
};

// Schema de validação (baseado no insertMarketplaceItemSchema do backend)
const marketplaceFormSchema = z
  .object({
    title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
    description: z.string().max(2000, "Descrição muito longa").optional(),
    category: z.string().max(100, "Categoria muito longa").optional(),
    type: z.enum(["sale", "donation", "exchange"], { required_error: "Tipo é obrigatório" }),
    price: z.string().optional(),
  })
  .refine(
    (data) => {
      // Se for venda, preço é obrigatório
      if (data.type === "sale") {
        return !!data.price && parseFloat(data.price) > 0;
      }
      return true;
    },
    {
      message: "Preço é obrigatório para vendas",
      path: ["price"],
    }
  );

type MarketplaceFormValues = z.infer<typeof marketplaceFormSchema>;

export default function MarketplacePage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MarketplaceItem | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const form = useForm<MarketplaceFormValues>({
    resolver: zodResolver(marketplaceFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      type: "sale",
      price: "",
    },
  });

  const { data: items, isLoading } = useQuery<MarketplaceItem[]>({
    queryKey: ["/api/marketplace"],
  });

  const addItemMutation = useMutation({
    mutationFn: async (data: MarketplaceFormValues) => {
      return await apiRequest("POST", "/api/marketplace", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Sucesso",
        description: "Item adicionado ao marketplace",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar item",
        variant: "destructive",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MarketplaceFormValues> }) => {
      return await apiRequest("PATCH", `/api/marketplace/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace"] });
      setEditingItem(null);
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Sucesso",
        description: "Item atualizado",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar item",
        variant: "destructive",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/marketplace/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace"] });
      toast({
        title: "Sucesso",
        description: "Item removido",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover item",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MarketplaceFormValues) => {
    if (editingItem) {
      updateItemMutation.mutate({
        id: editingItem.id,
        data,
      });
    } else {
      addItemMutation.mutate(data);
    }
  };

  const handleEdit = (item: MarketplaceItem) => {
    setEditingItem(item);
    form.reset({
      title: item.title,
      description: item.description || "",
      category: item.category || "",
      type: item.type,
      price: item.price || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja remover este item?")) {
      deleteItemMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    form.reset({
      title: "",
      description: "",
      category: "",
      type: "sale",
      price: "",
    });
    setIsDialogOpen(true);
  };

  const filteredItems = items?.filter((item) => {
    const typeMatch = filterType === "all" || item.type === filterType;
    const categoryMatch = filterCategory === "all" || item.category === filterCategory;
    return typeMatch && categoryMatch;
  });

  const categories = Array.from(new Set(items?.map((i) => i.category).filter(Boolean) || []));

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "sale":
        return "Venda";
      case "donation":
        return "Doação";
      case "exchange":
        return "Troca";
      default:
        return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available":
        return "Disponível";
      case "sold":
        return "Vendido";
      case "reserved":
        return "Reservado";
      case "removed":
        return "Removido";
      default:
        return status;
    }
  };

  const watchType = form.watch("type");

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground">Venda, doe ou troque itens com seus vizinhos</p>
        </div>
        <Button onClick={handleAddNew} data-testid="button-add-item">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Item
        </Button>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="filter-type" className="text-sm font-medium">
                Tipo
              </label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger id="filter-type" data-testid="filter-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="sale">Vendas</SelectItem>
                  <SelectItem value="donation">Doações</SelectItem>
                  <SelectItem value="exchange">Trocas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="filter-category" className="text-sm font-medium">
                Categoria
              </label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger id="filter-category" data-testid="filter-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat as string}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Itens */}
      {isLoading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : filteredItems && filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} data-testid={`card-item-${item.id}`} className="hover-elevate">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <div className="flex gap-1">
                    <Badge variant={item.type === "sale" ? "default" : item.type === "donation" ? "secondary" : "outline"}>
                      {getTypeLabel(item.type)}
                    </Badge>
                  </div>
                </div>
                <CardDescription>{item.description || "Sem descrição"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {item.category && (
                    <div>
                      <span className="font-semibold">Categoria:</span> {item.category}
                    </div>
                  )}
                  {item.type === "sale" && item.price && (
                    <div className="text-lg font-bold text-primary">
                      R$ {parseFloat(item.price).toFixed(2)}
                    </div>
                  )}
                  {item.block && item.unit && (
                    <div>
                      <span className="font-semibold">Localização:</span> Bloco {item.block}, Apto {item.unit}
                    </div>
                  )}
                  <div>
                    <Badge variant={item.status === "available" ? "default" : "secondary"}>
                      {getStatusLabel(item.status)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(item)}
                  data-testid={`button-edit-${item.id}`}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  data-testid={`button-delete-${item.id}`}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remover
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum item encontrado no marketplace
          </CardContent>
        </Card>
      )}

      {/* Dialog para Adicionar/Editar Item */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar Item" : "Adicionar Item"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea {...field} data-testid="input-description" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-type">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sale">Venda</SelectItem>
                        <SelectItem value="donation">Doação</SelectItem>
                        <SelectItem value="exchange">Troca</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-category" placeholder="Ex: Roupas, Móveis, Eletrônicos..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchType === "sale" && (
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (R$) *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-price" type="number" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    form.reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" data-testid="button-submit-item" disabled={form.formState.isSubmitting}>
                  {editingItem ? "Atualizar" : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
