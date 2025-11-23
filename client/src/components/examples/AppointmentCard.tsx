import AppointmentCard from '../AppointmentCard';

export default function AppointmentCardExample() {
  return (
    <div className="p-4 max-w-md">
      <AppointmentCard
        id="1"
        serviceProviderName="Studio da Ana"
        serviceType="Corte de Cabelo"
        date={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)}
        time="14:00"
        location="Apto 405"
        status="scheduled"
        onCancel={(id) => console.log('Cancel:', id)}
        onReschedule={(id) => console.log('Reschedule:', id)}
      />
    </div>
  );
}
