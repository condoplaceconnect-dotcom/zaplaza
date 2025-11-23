import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Star } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  unit?: string;
  avatar?: string;
  isVendor?: boolean;
  storeName?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  onEdit: () => void;
}

export default function ProfileHeader({
  name,
  unit,
  avatar,
  isVendor = false,
  storeName,
  category,
  rating,
  reviewCount,
  onEdit
}: ProfileHeaderProps) {
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        <Avatar className="w-24 h-24">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold" data-testid="text-profile-name">
              {name}
            </h1>
            {isVendor && (
              <Badge variant="default" className="w-fit">Vendedor</Badge>
            )}
          </div>
          
          {unit && (
            <p className="text-muted-foreground mb-2">
              Unidade {unit}
            </p>
          )}
          
          {isVendor && storeName && (
            <div className="space-y-1">
              <p className="font-semibold text-lg" data-testid="text-store-name">
                {storeName}
              </p>
              {category && (
                <Badge variant="secondary" data-testid="badge-store-category">
                  {category}
                </Badge>
              )}
              {rating && reviewCount !== undefined && (
                <div className="flex items-center gap-1 text-sm mt-2">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  <span className="font-semibold">{rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({reviewCount} avaliações)</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <Button onClick={onEdit} data-testid="button-edit-profile">
          <Edit className="w-4 h-4 mr-2" />
          Editar Perfil
        </Button>
      </div>
    </Card>
  );
}
