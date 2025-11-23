import ServiceCard from '../ServiceCard';

export default function ServiceCardExample() {
  return (
    <div className="p-4 max-w-md">
      <ServiceCard
        id="1"
        name="Studio da Ana - Cabeleireira"
        category="Beleza"
        rating={4.9}
        reviewCount={84}
        priceRange="R$ 50-150"
        onClick={(id) => console.log('Service clicked:', id)}
      />
    </div>
  );
}
