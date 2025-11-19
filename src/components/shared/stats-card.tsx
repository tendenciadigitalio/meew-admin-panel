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
    <Card className="border border-gray-200 rounded-md hover:border-gray-300 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="text-sm font-normal text-gray-500">
            {title}
          </div>
          <Icon className="h-5 w-5 text-gray-400 stroke-[1.5]" />
        </div>
        <div className="text-3xl font-bold text-gray-900 tabular-nums">
          {value}
        </div>
        {description && (
          <p className="mt-2 text-xs text-gray-500">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
