import { useState } from "react";
import HeroBanner from "@/components/HeroBanner";
import CategoryChips from "@/components/CategoryChips";
import ProductCard from "@/components/ProductCard";
import StoreCard from "@/components/StoreCard";
import SearchBar from "@/components/SearchBar";
import CondoSelector from "@/components/CondoSelector";
import CartButton from "@/components/CartButton";
import CartDrawer from "@/components/CartDrawer";
import ThemeToggle from "@/components/ThemeToggle";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

import heroBannerImg from '@assets/generated_images/marketplace_hero_banner.png';
import brigadeiroImg from '@assets/generated_images/brigadeiro_dessert_product_photo.png';
import cheeseImg from '@assets/generated_images/cheese_bread_product_photo.png';
import lunchImg from '@assets/generated_images/lunch_box_product_photo.png';
import juiceImg from '@assets/generated_images/fresh_juice_product_photo.png';
import cookiesImg from '@assets/generated_images/cookies_assortment_photo.png';
import brownieImg from '@assets/generated_images/brownie_dessert_photo.png';
import salgadoImg from '@assets/generated_images/brazilian_savory_snacks_photo.png';

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCondo, setSelectedCondo] = useState<{ id: string; name: string } | null>(null);
  
  const [cartItems, setCartItems] = useState<Array<{ id: string; name: string; price: number; quantity: number; image: string }>>([]);

  const condos = [
    // Adicione seus condominios aqui após o cadastro
  ];

  const banners = [
    {
      id: '1',
      image: heroBannerImg,
      title: 'Compre de vizinhos',
      subtitle: 'Produtos frescos direto do seu condomínio'
    },
    {
      id: '2',
      image: heroBannerImg,
      title: 'Entrega rápida',
      subtitle: 'Receba em minutos, sem sair de casa'
    }
  ];

  const categories: string[] = [];

  const stores: Array<{ id: string; name: string; category: string; rating: number; reviewCount: number; deliveryTime: string }> = [];

  const products: Array<{ id: string; name: string; description: string; price: number; image: string; category: string }> = [];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cartItems.find(item => item.id === productId);
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCartItems([...cartItems, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image
      }]);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      setCartItems(cartItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <CondoSelector
            condos={condos}
            selectedCondo={selectedCondo}
            onSelectCondo={setSelectedCondo}
          />
          <SearchBar value={search} onChange={setSearch} />
          <div className="flex gap-2">
            <CartButton
              itemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              onClick={() => setCartOpen(true)}
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setLocation('/register')}
              data-testid="button-register"
            >
              Cadastro
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <HeroBanner banners={banners} />

        <div className="flex gap-4 justify-center flex-wrap">
          <Button
            size="lg"
            onClick={() => setLocation('/services')}
            data-testid="button-browse-services"
            className="flex-1 max-w-sm"
          >
            Buscar Serviços & Profissionais
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => setLocation('/register-condo')}
            data-testid="button-register-condo"
            className="flex-1 max-w-sm"
          >
            Registrar Condomínio
          </Button>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Categorias de Produtos</h2>
          <CategoryChips
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Lojas Populares</h2>
          {stores.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg border">
              <p className="text-muted-foreground">Nenhuma loja cadastrada ainda</p>
              <p className="text-sm text-muted-foreground mt-2">Seja o primeiro vendedor! Clique em "Cadastro" para registrar sua loja</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.map(store => (
                <StoreCard
                  key={store.id}
                  {...store}
                  onClick={(id) => console.log('Navigate to store:', id)}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">
            {selectedCategory ? selectedCategory : 'Todos os Produtos'}
          </h2>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg border">
              <p className="text-muted-foreground">Nenhum produto cadastrado ainda</p>
              <p className="text-sm text-muted-foreground mt-2">Os produtos aparecerão aqui quando lojas começarem a vender</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  {...product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav onNavigate={setLocation} />

      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={() => {
          console.log('Checkout');
          setCartOpen(false);
        }}
      />
    </div>
  );
}
