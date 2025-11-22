import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  onAddToCart: (id: string) => void;
}

export default function ProductCard({ 
  id, 
  name, 
  description, 
  price, 
  image, 
  onAddToCart 
}: ProductCardProps) {
  return (
    <Card className="overflow-hidden hover-elevate group cursor-pointer">
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          data-testid={`img-product-${id}`}
        />
        <Button
          size="icon"
          className="absolute bottom-2 right-2 rounded-full shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(id);
          }}
          data-testid={`button-add-to-cart-${id}`}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg line-clamp-1" data-testid={`text-product-name-${id}`}>
          {name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1" data-testid={`text-product-description-${id}`}>
          {description}
        </p>
        <p className="text-xl font-bold text-primary mt-3" data-testid={`text-product-price-${id}`}>
          R$ {price.toFixed(2)}
        </p>
      </div>
    </Card>
  );
}
