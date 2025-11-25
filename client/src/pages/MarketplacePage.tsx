import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, Wrench, Store } from "lucide-react";
import ProductsTab from "@/components/Marketplace/ProductsTab";
import ServicesTab from "@/components/Marketplace/ServicesTab";
import StoresTab from "@/components/Marketplace/StoresTab"; // Import the final tab component

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground">Compre, venda e contrate no seu condomínio.</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar produtos, serviços ou vendedores..."
          className="pl-12 text-base h-14 rounded-full bg-muted border-2 focus-visible:ring-primary"
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
        />
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted p-1 h-12 rounded-full">
          <TabsTrigger value="products" className="rounded-full flex-1 data-[state=active]:bg-background data-[state=active]:shadow-sm"><ShoppingCart className="w-5 h-5 mr-2"/>Produtos</TabsTrigger>
          <TabsTrigger value="services" className="rounded-full flex-1 data-[state=active]:bg-background data-[state=active]:shadow-sm"><Wrench className="w-5 h-5 mr-2"/>Serviços</TabsTrigger>
          <TabsTrigger value="stores" className="rounded-full flex-1 data-[state=active]:bg-background data-[state=active]:shadow-sm"><Store className="w-5 h-5 mr-2"/>Lojas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="mt-6">
          <ProductsTab 
            searchTerm={searchTerm} 
            selectedCategories={selectedCategories} 
            setSelectedCategories={setSelectedCategories} 
          />
        </TabsContent>
        
        <TabsContent value="services" className="mt-6">
          <ServicesTab 
            searchTerm={searchTerm} 
            selectedCategories={selectedCategories} 
            setSelectedCategories={setSelectedCategories} 
          />
        </TabsContent>
        
        <TabsContent value="stores" className="mt-6">
          <StoresTab searchTerm={searchTerm} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
