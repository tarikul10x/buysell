import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  icon: string;
  iconColor: 'purple' | 'green' | 'orange' | 'blue' | 'red' | 'teal';
  title: string;
  value: string;
  subtitle: string;
  dataTestId?: string;
}

export default function StatsCard({ icon, iconColor, title, value, subtitle, dataTestId }: StatsCardProps) {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    teal: 'bg-teal-100 text-teal-600',
  };

  const subtitleColors = {
    purple: 'text-purple-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    blue: 'text-blue-600',
    red: 'text-red-600',
    teal: 'text-teal-600',
  };

  return (
    <Card className="border shadow-sm card-hover">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[iconColor]}`}>
            <i className={`${icon} text-xl`}></i>
          </div>
          <span className="text-xs text-muted-foreground">{title}</span>
        </div>
        <h3 className="text-2xl font-bold text-foreground" data-testid={dataTestId}>{value}</h3>
        <p className={`text-sm ${subtitle.includes('+') ? subtitleColors[iconColor] : 'text-muted-foreground'}`}>
          {subtitle}
        </p>
      </CardContent>
    </Card>
  );
}
