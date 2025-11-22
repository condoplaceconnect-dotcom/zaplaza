import { useState } from 'react';
import CartButton from '../CartButton';

export default function CartButtonExample() {
  const [count, setCount] = useState(3);

  return (
    <div className="p-4">
      <CartButton 
        itemCount={count} 
        onClick={() => {
          console.log('Cart clicked');
          setCount(c => c + 1);
        }} 
      />
    </div>
  );
}
