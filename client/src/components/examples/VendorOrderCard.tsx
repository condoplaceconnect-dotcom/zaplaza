import { useState } from 'react';
import VendorOrderCard from '../VendorOrderCard';

export default function VendorOrderCardExample() {
  const [status, setStatus] = useState<'pending' | 'accepted' | 'preparing' | 'ready' | 'delivered'>('pending');

  return (
    <div className="p-4 max-w-md">
      <VendorOrderCard
        id="123"
        customerName="João Silva"
        unit="301"
        items={[
          { name: 'Brigadeiro Gourmet', quantity: 6, price: 3.50 },
          { name: 'Brownie', quantity: 2, price: 8.00 }
        ]}
        total={37.00}
        status={status}
        date={new Date()}
        onAccept={(id) => {
          console.log('Accept:', id);
          setStatus('accepted');
        }}
        onReject={(id) => console.log('Reject:', id)}
        onUpdateStatus={(id, newStatus) => {
          console.log('Update status:', id, newStatus);
          setStatus(newStatus as any);
        }}
      />
    </div>
  );
}
