import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Clock } from "lucide-react";

interface StoreCardProps {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  avatar?: string;
  onClick: (id: string) => void;
}

export default function StoreCard({
  id,
  name,
  category,
  rating,
  reviewCount,
  deliveryTime,
  avatar,
  onClick
}: StoreCardProps) {
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <Card 
      className="p-4 hover-elevate cursor-pointer"
      onClick={() => onClick(id)}
      data-testid={`card-store-${id}`}
    >
      <div className="flex gap-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg line-clamp-1" data-testid={`text-store-name-${id}`}>
            {name}
          </h3>
          <Badge variant="secondary" className="mt-1" data-testid={`badge-category-${id}`}>
            {category}
          </Badge>
          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span data-testid={`text-rating-${id}`}>{rating.toFixed(1)}</span>
              <span>({reviewCount})</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span data-testid={`text-delivery-time-${id}`}>{deliveryTime}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
