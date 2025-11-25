import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StoreTab from "@/components/StoreTab";
import ServicesTab from "@/components/ServicesTab";
import MarketplaceTab from "@/components/MarketplaceTab";

export default function HomePage() {
  return (
    <div>
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-primary">CondoPlace</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="store">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="store">Loja</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          </TabsList>
          <TabsContent value="store">
            <StoreTab />
          </TabsContent>
          <TabsContent value="services">
            <ServicesTab />
          </TabsContent>
          <TabsContent value="marketplace">
            <MarketplaceTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
