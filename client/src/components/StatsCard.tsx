import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconColor?: string;
}

export default function StatsCard({ icon: Icon, label, value, iconColor = "text-primary" }: StatsCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg bg-secondary ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}>
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
}
