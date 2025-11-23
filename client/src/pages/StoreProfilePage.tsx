import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Plus, Trash2, Edit2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  ingredients?: string;
  available: boolean;
}

interface Store {
  id: string;
  name: string;
  description: string;
  category: string;
  image?: string;
  phone: string;
  email: string;
}

export default function StoreProfilePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    category: "",
    ingredients: "",
    available: true,
  });

  useEffect(() => {
    // Simular carregamento da loja
    setStore({
      id: "1",
      name: "Minha Loja",
      description: "Loja de produtos frescos",
      category: "Sobremesas",
      phone: "(11) 98765-4321",
      email: "loja@email.com",
    });
  }, []);

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      toast({
        title: "Erro",
        description: "Nome e preço são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const product: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProduct.name!,
      description: newProduct.description || "",
      price: newProduct.price!,
      category: newProduct.category || "",
      ingredients: newProduct.ingredients,
      available: true,
    };

    setProducts([...products, product]);
    setNewProduct({
      name: "",
      description: "",
      price: 0,
      category: "",
      ingredients: "",
      available: true,
    });

    toast({
      title: "Sucesso",
      description: "Produto adicionado com sucesso!",
    });
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
    toast({
      title: "Produto removido",
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    setProducts(
      products.map((p) => (p.id === editingProduct.id ? editingProduct : p))
    );
    setEditingProduct(null);
    toast({
      title: "Produto atualizado",
    });
  };

  if (!store) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">
          <div className="h-12 w-12 bg-primary rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/vendor")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Perfil da Loja</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info" data-testid="tab-info">
              Informações
            </TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">
              Produtos ({products.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB: INFORMAÇÕES */}
          <TabsContent value="info" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Editar Informações da Loja</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="store-name">Nome da Loja</Label>
                  <Input
                    id="store-name"
                    placeholder="Nome da sua loja"
                    defaultValue={store.name}
                    data-testid="input-store-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-description">Descrição</Label>
                  <Textarea
                    id="store-description"
                    placeholder="Descreva sua loja..."
                    defaultValue={store.description}
                    rows={4}
                    data-testid="textarea-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-category">Categoria</Label>
                  <Input
                    id="store-category"
                    placeholder="Ex: Sobremesas, Lanches"
                    defaultValue={store.category}
                    data-testid="input-category"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-phone">Telefone</Label>
                  <Input
                    id="store-phone"
                    placeholder="(11) 98765-4321"
                    defaultValue={store.phone}
                    data-testid="input-phone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-email">Email</Label>
                  <Input
                    id="store-email"
                    type="email"
                    placeholder="loja@email.com"
                    defaultValue={store.email}
                    data-testid="input-email"
                  />
                </div>

                <Button data-testid="button-save-info">Salvar Informações</Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB: PRODUTOS */}
          <TabsContent value="products" className="space-y-6">
            {editingProduct ? (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Editar Produto</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nome do Produto</Label>
                    <Input
                      id="edit-name"
                      value={editingProduct.name}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, name: e.target.value })
                      }
                      data-testid="input-edit-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Descrição</Label>
                    <Textarea
                      id="edit-description"
                      value={editingProduct.description}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      data-testid="textarea-edit-description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-price">Preço (R$)</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      step="0.01"
                      value={editingProduct.price}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          price: parseFloat(e.target.value),
                        })
                      }
                      data-testid="input-edit-price"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-ingredients">Ingredientes</Label>
                    <Textarea
                      id="edit-ingredients"
                      value={editingProduct.ingredients || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          ingredients: e.target.value,
                        })
                      }
                      placeholder="Liste os ingredientes..."
                      rows={2}
                      data-testid="textarea-edit-ingredients"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdateProduct}
                      data-testid="button-update-product"
                    >
                      Salvar Alterações
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingProduct(null)}
                      data-testid="button-cancel-edit"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Adicionar Novo Produto</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-name">Nome do Produto *</Label>
                    <Input
                      id="product-name"
                      placeholder="Ex: Brigadeiro Gourmet"
                      value={newProduct.name || ""}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                      data-testid="input-product-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-description">Descrição</Label>
                    <Textarea
                      id="product-description"
                      placeholder="Descreva o produto..."
                      value={newProduct.description || ""}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, description: e.target.value })
                      }
                      rows={3}
                      data-testid="textarea-product-description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="product-price">Preço (R$) *</Label>
                      <Input
                        id="product-price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newProduct.price || ""}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            price: parseFloat(e.target.value),
                          })
                        }
                        data-testid="input-product-price"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="product-category">Categoria</Label>
                      <Input
                        id="product-category"
                        placeholder="Ex: Sobremesa"
                        value={newProduct.category || ""}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, category: e.target.value })
                        }
                        data-testid="input-product-category"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-ingredients">Ingredientes</Label>
                    <Textarea
                      id="product-ingredients"
                      placeholder="Liste os ingredientes (opcional)..."
                      value={newProduct.ingredients || ""}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, ingredients: e.target.value })
                      }
                      rows={2}
                      data-testid="textarea-ingredients"
                    />
                  </div>

                  <Button
                    onClick={handleAddProduct}
                    className="w-full"
                    data-testid="button-add-product"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Produto
                  </Button>
                </div>
              </Card>
            )}

            {/* LISTA DE PRODUTOS */}
            {products.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Produtos Cadastrados</h2>
                <div className="space-y-3">
                  {products.map((product) => (
                    <Card key={product.id} className="p-4" data-testid={`card-product-${product.id}`}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{product.name}</h3>
                            <Badge
                              variant={product.available ? "default" : "secondary"}
                              data-testid={`badge-status-${product.id}`}
                            >
                              {product.available ? "Disponível" : "Indisponível"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {product.description}
                          </p>
                          {product.ingredients && (
                            <p className="text-xs text-muted-foreground mb-2">
                              <strong>Ingredientes:</strong> {product.ingredients}
                            </p>
                          )}
                          <p className="font-semibold text-lg">
                            R$ {product.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleEditProduct(product)}
                            data-testid={`button-edit-${product.id}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDeleteProduct(product.id)}
                            data-testid={`button-delete-${product.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {products.length === 0 && !editingProduct && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Nenhum produto cadastrado ainda. Adicione seus primeiros produtos acima!
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
