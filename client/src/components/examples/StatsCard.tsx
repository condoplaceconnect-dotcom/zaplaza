import StatsCard from '../StatsCard';
import { ShoppingBag, Star, Calendar } from 'lucide-react';

export default function StatsCardExample() {
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatsCard icon={ShoppingBag} label="Total de Pedidos" value={42} />
      <StatsCard icon={Star} label="Avaliação Média" value="4.8" iconColor="text-accent" />
      <StatsCard icon={Calendar} label="Agendamentos" value={15} iconColor="text-primary" />
    </div>
  );
}
