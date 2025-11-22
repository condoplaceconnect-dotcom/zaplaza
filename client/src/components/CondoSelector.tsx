import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, ChevronDown } from "lucide-react";

interface Condo {
  id: string;
  name: string;
}

interface CondoSelectorProps {
  condos: Condo[];
  selectedCondo: Condo | null;
  onSelectCondo: (condo: Condo) => void;
}

export default function CondoSelector({
  condos,
  selectedCondo,
  onSelectCondo
}: CondoSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2" data-testid="button-condo-selector">
          <Building2 className="w-5 h-5" />
          <span className="max-w-[150px] truncate">
            {selectedCondo ? selectedCondo.name : 'Selecione o condomínio'}
          </span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {condos.map((condo) => (
          <DropdownMenuItem
            key={condo.id}
            onClick={() => onSelectCondo(condo)}
            data-testid={`menuitem-condo-${condo.id}`}
          >
            {condo.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
