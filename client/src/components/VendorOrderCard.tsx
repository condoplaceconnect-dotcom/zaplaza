import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock } from "lucide-react";

interface VendorOrderCardProps {
  id: string;
  customerName: string;
  unit: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivered';
  date: Date;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onUpdateStatus?: (id: string, status: string) => void;
}

export default function VendorOrderCard({
  id,
  customerName,
  unit,
  items,
  total,
  status,
  date,
  onAccept,
  onReject,
  onUpdateStatus
}: VendorOrderCardProps) {
  return (
    <Card className="p-4" data-testid={`card-vendor-order-${id}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg" data-testid={`text-customer-${id}`}>
            {customerName}
          </h3>
          <p className="text-sm text-muted-foreground">Unidade {unit}</p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <Clock className="w-3 h-3" />
            <span>{date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        <Badge variant={status === 'pending' ? 'secondary' : 'default'}>
          {status === 'pending' && 'Novo Pedido'}
          {status === 'accepted' && 'Aceito'}
          {status === 'preparing' && 'Preparando'}
          {status === 'ready' && 'Pronto'}
          {status === 'delivered' && 'Entregue'}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span>{item.quantity}x {item.name}</span>
            <span className="text-muted-foreground">R$ {(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 border-t mb-4">
        <span className="font-semibold">Total</span>
        <span className="text-xl font-bold text-primary" data-testid={`text-vendor-order-total-${id}`}>
          R$ {total.toFixed(2)}
        </span>
      </div>

      {status === 'pending' && onAccept && onReject && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onReject(id)}
            data-testid={`button-reject-${id}`}
          >
            <X className="w-4 h-4 mr-2" />
            Recusar
          </Button>
          <Button
            className="flex-1"
            onClick={() => onAccept(id)}
            data-testid={`button-accept-${id}`}
          >
            <Check className="w-4 h-4 mr-2" />
            Aceitar
          </Button>
        </div>
      )}

      {status === 'accepted' && onUpdateStatus && (
        <Button
          className="w-full"
          onClick={() => onUpdateStatus(id, 'preparing')}
          data-testid={`button-start-preparing-${id}`}
        >
          Iniciar Preparo
        </Button>
      )}

      {status === 'preparing' && onUpdateStatus && (
        <Button
          className="w-full"
          onClick={() => onUpdateStatus(id, 'ready')}
          data-testid={`button-mark-ready-${id}`}
        >
          Marcar como Pronto
        </Button>
      )}

      {status === 'ready' && onUpdateStatus && (
        <Button
          className="w-full"
          variant="secondary"
          onClick={() => onUpdateStatus(id, 'delivered')}
          data-testid={`button-mark-delivered-${id}`}
        >
          Marcar como Entregue
        </Button>
      )}
    </Card>
  );
}
