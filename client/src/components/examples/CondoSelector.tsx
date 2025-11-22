import { useState } from 'react';
import CondoSelector from '../CondoSelector';

export default function CondoSelectorExample() {
  const condos = [
    { id: '1', name: 'Residencial Jardim das Flores' },
    { id: '2', name: 'Condomínio Vila Verde' },
    { id: '3', name: 'Edifício Solar do Parque' }
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
