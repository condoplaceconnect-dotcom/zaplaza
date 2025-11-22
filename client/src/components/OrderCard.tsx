import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Package, Clock } from "lucide-react";

interface OrderCardProps {
  id: string;
  storeName: string;
  storeAvatar?: string;
  items: Array<{ name: string; quantity: number }>;
  total: number;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  date: Date;
  onViewDetails: (id: string) => void;
}

const statusConfig = {
  pending: { label: 'Pendente', variant: 'secondary' as const },
  accepted: { label: 'Aceito', variant: 'default' as const },
  preparing: { label: 'Preparando', variant: 'default' as const },
  ready: { label: 'Pronto', variant: 'default' as const },
  delivered: { label: 'Entregue', variant: 'secondary' as const },
  cancelled: { label: 'Cancelado', variant: 'destructive' as const }
};

export default function OrderCard({
  id,
  storeName,
  storeAvatar,
  items,
  total,
  status,
  date,
  onViewDetails
}: OrderCardProps) {
  const initials = storeName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const config = statusConfig[status];

  return (
    <Card className="p-4" data-testid={`card-order-${id}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={storeAvatar} alt={storeName} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold" data-testid={`text-order-store-${id}`}>
              {storeName}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Clock className="w-3 h-3" />
              <span data-testid={`text-order-date-${id}`}>
                {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
        <Badge variant={config.variant} data-testid={`badge-order-status-${id}`}>
          {config.label}
        </Badge>
      </div>
      
      <div className="space-y-1 mb-4">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {item.quantity}x {item.name}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div>
          <span className="text-sm text-muted-foreground">Total</span>
          <p className="text-xl font-bold text-primary" data-testid={`text-order-total-${id}`}>
            R$ {total.toFixed(2)}
          </p>
        </div>
        <Button 
          variant="outline"
          onClick={() => onViewDetails(id)}
          data-testid={`button-view-order-${id}`}
        >
          <Package className="w-4 h-4 mr-2" />
          Ver detalhes
        </Button>
      </div>
    </Card>
  );
}
