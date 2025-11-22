import { useState } from 'react';
import CategoryChips from '../CategoryChips';

export default function CategoryChipsExample() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="p-4">
      <CategoryChips
        categories={['Lanches', 'Sobremesas', 'Bebidas', 'Salgados', 'Almoço', 'Café']}
        selectedCategory={selected}
        onSelectCategory={setSelected}
      />
    </div>
  );
}
