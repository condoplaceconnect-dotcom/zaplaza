import { useState } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import StatsCard from "@/components/StatsCard";
import ProductCard from "@/components/ProductCard";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import ThemeToggle from "@/components/ThemeToggle";
import BottomNav from "@/components/BottomNav";
import { useLocation } from "wouter";
import { ArrowLeft, TrendingUp, Star, ShoppingBag, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import brigadeiroImg from '@assets/generated_images/brigadeiro_dessert_product_photo.png';
import brownieImg from '@assets/generated_images/brownie_dessert_photo.png';
import cookiesImg from '@assets/generated_images/cookies_assortment_photo.png';

export default function VendorProfilePage() {
  const [, setLocation] = useLocation();
  const [storeOpen, setStoreOpen] = useState(true);

  const products = [
    { id: '1', name: 'Brigadeiro Gourmet', description: 'Delicioso brigadeiro artesanal feito com chocolate belga', price: 3.50, image: brigadeiroImg },
    { id: '2', name: 'Brownie', description: 'Brownie de chocolate meio amargo', price: 8.00, image: brownieImg },
    { id: '3', name: 'Cookies Caseiros', description: 'Cookies artesanais de chocolate e aveia', price: 12.00, image: cookiesImg },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/vendor')}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Perfil da Loja</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/settings')}
              data-testid="button-settings"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <ProfileHeader
          name="Maria Santos"
          unit="405"
          isVendor
          storeName="Doces da Maria"
          category="Sobremesas"
          rating={4.8}
          reviewCount={127}
          onEdit={() => console.log('Edit vendor profile')}
        />

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">Status da Loja</h3>
              <p className="text-sm text-muted-foreground">
                {storeOpen ? 'Sua loja está aberta e aceitando pedidos' : 'Sua loja está fechada'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={storeOpen ? "default" : "secondary"}>
                {storeOpen ? 'Aberta' : 'Fechada'}
              </Badge>
              <Switch
                checked={storeOpen}
                onCheckedChange={setStoreOpen}
                data-testid="switch-store-status"
              />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard icon={TrendingUp} label="Vendas do Mês" value="R$ 1.245" iconColor="text-primary" />
          <StatsCard icon={ShoppingBag} label="Total de Pedidos" value={156} />
          <StatsCard icon={Star} label="Avaliação Média" value="4.8" iconColor="text-accent" />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Meus Produtos</h2>
            <Button onClick={() => console.log('Add product')} data-testid="button-add-product">
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={(id) => console.log('Edit product:', id)}
              />
            ))}
          </div>
        </div>
      </main>

      <BottomNav onNavigate={setLocation} />
    </div>
  );
}
