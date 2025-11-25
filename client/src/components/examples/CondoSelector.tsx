import { useState } from 'react';
import CondoSelector from '../CondoSelector';

export default function CondoSelectorExample() {
  const condos = [
    { id: 'condo-acqua-sena', name: 'Acqua Sena' },
  ];

  const [selected, setSelected] = useState(condos[0]);

  return (
    <div className="p-4">
      <CondoSelector
        condos={condos}
        selectedCondo={selected}
        onSelectCondo={setSelected}
      />
    </div>
  );
}
