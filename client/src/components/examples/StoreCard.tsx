import StoreCard from '../StoreCard';

export default function StoreCardExample() {
  return (
    <div className="p-4 max-w-md">
      <StoreCard
        id="1"
        name="Doces da Maria"
        category="Sobremesas"
        rating={4.8}
        reviewCount={127}
        deliveryTime="15-20 min"
        onClick={(id) => console.log('Store clicked:', id)}
      />
    </div>
  );
}
