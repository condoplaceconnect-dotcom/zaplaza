import ProductCard from '../ProductCard';
import brigadeiroImg from '@assets/generated_images/brigadeiro_dessert_product_photo.png';

export default function ProductCardExample() {
  return (
    <div className="p-4 max-w-xs">
      <ProductCard
        id="1"
        name="Brigadeiro Gourmet"
        description="Delicioso brigadeiro artesanal feito com chocolate belga"
        price={3.50}
        image={brigadeiroImg}
        onAddToCart={(id) => console.log('Added to cart:', id)}
      />
    </div>
  );
}
