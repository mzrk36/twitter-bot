import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: string;
  color: "blue" | "green" | "yellow" | "purple" | "red";
  loading?: boolean;
}

const colorClasses = {
  blue: "bg-blue-600/20 text-blue-400",
  green: "bg-green-600/20 text-green-400", 
  yellow: "bg-yellow-600/20 text-yellow-400",
  purple: "bg-purple-600/20 text-purple-400",
  red: "bg-red-600/20 text-red-400",
};

export default function StatsCard({ 
  title, 
  value, 
  change, 
  icon, 
  color, 
  loading 
}: StatsCardProps) {
  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 bg-slate-700" />
              <Skeleton className="h-8 w-16 bg-slate-700" />
              <Skeleton className="h-3 w-32 bg-slate-700" />
            </div>
            <Skeleton className="h-12 w-12 rounded-lg bg-slate-700" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {change && (
              <p className="text-xs mt-1 text-green-400">
                <i className="fas fa-arrow-up mr-1"></i>
                {change}
              </p>
            )}
          </div>
          <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", colorClasses[color])}>
            <i className={`${icon} text-xl`}></i>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
