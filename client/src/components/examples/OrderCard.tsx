import OrderCard from '../OrderCard';

export default function OrderCardExample() {
  return (
    <div className="p-4 max-w-md">
      <OrderCard
        id="123"
        storeName="Doces da Maria"
        items={[
          { name: 'Brigadeiro Gourmet', quantity: 6 },
          { name: 'Brownie', quantity: 2 }
        ]}
        total={35.00}
        status="preparing"
        date={new Date()}
        onViewDetails={(id) => console.log('View order:', id)}
      />
    </div>
  );
}
