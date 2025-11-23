import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppointmentCardProps {
  id: string;
  serviceProviderName: string;
  serviceType: string;
  avatar?: string;
  date: Date;
  time: string;
  location: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  onCancel?: (id: string) => void;
  onReschedule?: (id: string) => void;
}

const statusConfig = {
  scheduled: { label: 'Agendado', variant: 'secondary' as const },
  confirmed: { label: 'Confirmado', variant: 'default' as const },
  completed: { label: 'Concluído', variant: 'secondary' as const },
  cancelled: { label: 'Cancelado', variant: 'destructive' as const }
};

export default function AppointmentCard({
  id,
  serviceProviderName,
  serviceType,
  avatar,
  date,
  time,
  location,
  status,
  onCancel,
  onReschedule
}: AppointmentCardProps) {
  const initials = serviceProviderName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const config = statusConfig[status];

  return (
    <Card className="p-4" data-testid={`card-appointment-${id}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={avatar} alt={serviceProviderName} />
            <AvatarFallback className="bg-accent text-accent-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold" data-testid={`text-appointment-provider-${id}`}>
              {serviceProviderName}
            </h3>
            <p className="text-sm text-muted-foreground">{serviceType}</p>
          </div>
        </div>
        <Badge variant={config.variant} data-testid={`badge-appointment-status-${id}`}>
          {config.label}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span data-testid={`text-appointment-date-${id}`}>
            {date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span data-testid={`text-appointment-time-${id}`}>{time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span data-testid={`text-appointment-location-${id}`}>{location}</span>
        </div>
      </div>

      {status === 'scheduled' && (onCancel || onReschedule) && (
        <div className="flex gap-2 pt-4 border-t">
          {onReschedule && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onReschedule(id)}
              data-testid={`button-reschedule-${id}`}
            >
              Reagendar
            </Button>
          )}
          {onCancel && (
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => onCancel(id)}
              data-testid={`button-cancel-${id}`}
            >
              Cancelar
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
