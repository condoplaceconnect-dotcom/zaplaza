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
  const [selectedCondo, setSelectedCondo] = useState({ id: '1', name: 'Residencial Jardim das Flores' });
  
  const [cartItems, setCartItems] = useState([
    { id: '1', name: 'Brigadeiro Gourmet', price: 3.50, quantity: 2, image: brigadeiroImg },
  ]);

  const condos = [
    { id: '1', name: 'Residencial Jardim das Flores' },
    { id: '2', name: 'Condomínio Vila Verde' },
    { id: '3', name: 'Edifício Solar do Parque' }
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

  const categories = ['Lanches', 'Sobremesas', 'Bebidas', 'Salgados', 'Almoço'];

  const stores = [
    { id: '1', name: 'Doces da Maria', category: 'Sobremesas', rating: 4.8, reviewCount: 127, deliveryTime: '15-20 min' },
    { id: '2', name: 'Lanchonete do Seu José', category: 'Lanches', rating: 4.6, reviewCount: 89, deliveryTime: '20-25 min' },
    { id: '3', name: 'Salgados da Dona Ana', category: 'Salgados', rating: 4.9, reviewCount: 203, deliveryTime: '10-15 min' },
  ];

  const products = [
    { id: '1', name: 'Brigadeiro Gourmet', description: 'Delicioso brigadeiro artesanal feito com chocolate belga', price: 3.50, image: brigadeiroImg, category: 'Sobremesas' },
    { id: '2', name: 'Pão de Queijo', description: 'Pão de queijo mineiro tradicional, quentinho', price: 2.00, image: cheeseImg, category: 'Lanches' },
    { id: '3', name: 'Marmita Fitness', description: 'Marmita saudável com arroz integral, frango grelhado e salada', price: 18.00, image: lunchImg, category: 'Almoço' },
    { id: '4', name: 'Suco Natural', description: 'Suco de laranja natural sem açúcar', price: 6.00, image: juiceImg, category: 'Bebidas' },
    { id: '5', name: 'Cookies Caseiros', description: 'Cookies artesanais de chocolate e aveia', price: 12.00, image: cookiesImg, category: 'Sobremesas' },
    { id: '6', name: 'Brownie', description: 'Brownie de chocolate meio amargo', price: 8.00, image: brownieImg, category: 'Sobremesas' },
    { id: '7', name: 'Salgadinhos Variados', description: 'Coxinha, empada e risole', price: 4.50, image: salgadoImg, category: 'Salgados' },
  ];

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
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <HeroBanner banners={banners} />

        <div className="flex gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => setLocation('/services')}
            data-testid="button-browse-services"
            className="flex-1 max-w-sm"
          >
            Buscar Serviços & Profissionais
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map(store => (
              <StoreCard
                key={store.id}
                {...store}
                onClick={(id) => console.log('Navigate to store:', id)}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">
            {selectedCategory ? selectedCategory : 'Todos os Produtos'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
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
