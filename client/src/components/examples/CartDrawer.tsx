import { useState } from 'react';
import CartDrawer from '../CartDrawer';
import { Button } from '@/components/ui/button';
import brigadeiroImg from '@assets/generated_images/brigadeiro_dessert_product_photo.png';
import brownieImg from '@assets/generated_images/brownie_dessert_photo.png';

export default function CartDrawerExample() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    {
      id: '1',
      name: 'Brigadeiro Gourmet',
      price: 3.50,
      quantity: 2,
      image: brigadeiroImg
    },
    {
      id: '2',
      name: 'Brownie',
      price: 8.00,
      quantity: 1,
      image: brownieImg
    }
  ]);

  const updateQuantity = (id: string, quantity: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Abrir Carrinho ({items.length})</Button>
      <CartDrawer
        open={open}
        onOpenChange={setOpen}
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={() => console.log('Checkout')}
      />
    </div>
  );
}
