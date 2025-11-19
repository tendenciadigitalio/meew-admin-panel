import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

export function StatsCard({ title, value, icon: Icon, description }: StatsCardProps) {
  return (
    <Card className="relative overflow-hidden transition-all duration-normal hover:border-gray-300">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-xs font-bold uppercase tracking-[0.1em] text-gray-500">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-gray-300" strokeWidth={1.5} />
      </CardHeader>
      <CardContent>
        <div className="metric-number mb-1">{value}</div>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
