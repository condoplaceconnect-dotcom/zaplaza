import AppointmentCalendar from '../AppointmentCalendar';

export default function AppointmentCalendarExample() {
  return (
    <div className="p-4 max-w-2xl">
      <AppointmentCalendar
        serviceProviderName="Studio da Ana"
        onSelectSlot={(date, time) => {
          console.log('Appointment booked:', date, time);
          alert(`Agendamento confirmado para ${date.toLocaleDateString('pt-BR')} às ${time}`);
        }}
      />
    </div>
  );
}
