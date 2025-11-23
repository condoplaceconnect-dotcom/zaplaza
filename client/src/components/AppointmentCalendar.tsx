import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface AppointmentCalendarProps {
  serviceProviderName: string;
  onSelectSlot: (date: Date, time: string) => void;
}

export default function AppointmentCalendar({
  serviceProviderName,
  onSelectSlot
}: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const timeSlots: TimeSlot[] = [
    { time: "09:00", available: true },
    { time: "10:00", available: true },
    { time: "11:00", available: false },
    { time: "14:00", available: true },
    { time: "15:00", available: true },
    { time: "16:00", available: true },
    { time: "17:00", available: false },
  ];

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Agendar com {serviceProviderName}</h3>
        <p className="text-sm text-muted-foreground">Selecione uma data e horário disponível</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">
            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h4>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={prevMonth}
              data-testid="button-prev-month"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={nextMonth}
              data-testid="button-next-month"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <button
              key={index}
              disabled={!day || isPast(day)}
              onClick={() => {
                if (day) {
                  setSelectedDate(day);
                  setSelectedTime(null);
                }
              }}
              className={`
                aspect-square rounded-md text-sm transition-colors
                ${!day ? 'invisible' : ''}
                ${isPast(day) ? 'text-muted-foreground cursor-not-allowed' : 'hover-elevate'}
                ${isToday(day) ? 'border-2 border-primary' : ''}
                ${selectedDate?.toDateString() === day?.toDateString() 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary'}
              `}
              data-testid={day ? `button-date-${day.getDate()}` : undefined}
            >
              {day?.getDate()}
            </button>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">
              Horários disponíveis - {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
            </h4>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {timeSlots.map((slot) => (
              <Button
                key={slot.time}
                variant={selectedTime === slot.time ? "default" : "outline"}
                disabled={!slot.available}
                onClick={() => setSelectedTime(slot.time)}
                data-testid={`button-time-${slot.time}`}
                className="relative"
              >
                {slot.time}
                {!slot.available && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 text-xs px-1"
                  >
                    Ocupado
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {selectedTime && (
            <Button
              className="w-full"
              onClick={() => {
                onSelectSlot(selectedDate, selectedTime);
              }}
              data-testid="button-confirm-appointment"
            >
              Confirmar Agendamento - {selectedDate.toLocaleDateString('pt-BR')} às {selectedTime}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
