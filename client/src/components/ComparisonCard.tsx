import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ComparisonCardProps {
  title: string;
  currentValue: number;
  previousValue: number;
  currentPeriod: string;
  previousPeriod: string;
  formatValue?: (value: number) => string;
  inverse?: boolean; // Se true, crescimento é ruim (ex: despesas)
}

export function ComparisonCard({
  title,
  currentValue,
  previousValue,
  currentPeriod,
  previousPeriod,
  formatValue = (v) => v.toLocaleString('pt-BR'),
  inverse = false,
}: ComparisonCardProps) {
  const difference = currentValue - previousValue;
  const percentageChange = previousValue !== 0 
    ? (difference / Math.abs(previousValue)) * 100 
    : 0;
  
  const isPositive = difference > 0;
  const isNeutral = difference === 0;
  
  // Determinar cor baseado em se crescimento é bom ou ruim
  const getColor = () => {
    if (isNeutral) return 'text-gray-600';
    if (inverse) {
      return isPositive ? 'text-red-600' : 'text-green-600';
    }
    return isPositive ? 'text-green-600' : 'text-red-600';
  };
  
  const getIcon = () => {
    if (isNeutral) return <Minus className="w-4 h-4" />;
    return isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };
  
  const color = getColor();
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground">{currentPeriod}</p>
            <p className="text-2xl font-bold">{formatValue(currentValue)}</p>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t">
            <div className={`flex items-center gap-1 ${color} font-medium text-sm`}>
              {getIcon()}
              <span>{Math.abs(percentageChange).toFixed(1)}%</span>
            </div>
            <span className="text-xs text-muted-foreground">
              vs {previousPeriod}: {formatValue(previousValue)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
