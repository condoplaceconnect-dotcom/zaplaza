import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CartButtonProps {
  itemCount: number;
  onClick: () => void;
}

export default function CartButton({ itemCount, onClick }: CartButtonProps) {
  return (
    <Button 
      size="icon" 
      variant="ghost" 
      className="relative" 
      onClick={onClick}
      data-testid="button-cart"
    >
      <ShoppingCart className="w-5 h-5" />
      {itemCount > 0 && (
        <Badge 
          className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          data-testid="badge-cart-count"
        >
          {itemCount}
        </Badge>
      )}
    </Button>
  );
}
