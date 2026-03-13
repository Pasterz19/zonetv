'use client';

interface ChartData {
  label: string;
  value: number;
}

interface AnalyticsChartProps {
  data: ChartData[];
  type: 'line' | 'bar';
  color?: 'blue' | 'red' | 'green' | 'purple' | 'amber';
}

const colorMap = {
  blue: {
    bg: 'bg-blue-500/20',
    line: 'bg-blue-500',
    text: 'text-blue-500'
  },
  red: {
    bg: 'bg-red-500/20',
    line: 'bg-red-500',
    text: 'text-red-500'
  },
  green: {
    bg: 'bg-emerald-500/20',
    line: 'bg-emerald-500',
    text: 'text-emerald-500'
  },
  purple: {
    bg: 'bg-purple-500/20',
    line: 'bg-purple-500',
    text: 'text-purple-500'
  },
  amber: {
    bg: 'bg-amber-500/20',
    line: 'bg-amber-500',
    text: 'text-amber-500'
  }
};

export function AnalyticsChart({ data, type = 'bar', color = 'blue' }: AnalyticsChartProps) {
  const colors = colorMap[color];
  const maxValue = Math.max(...data.map(d => d.value), 1);

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground">
        Brak danych do wyświetlenia
      </div>
    );
  }

  const formatLabel = (label: string) => {
    // Format YYYY-MM to Month abbreviation
    if (label.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = label.split('-');
      const months = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
      return months[parseInt(month) - 1];
    }
    return label;
  };

  return (
    <div className="h-48">
      <div className="flex h-full items-end gap-1">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex-1 flex flex-col items-center gap-1 group"
          >
            <div className="relative w-full">
              <div
                className={`w-full rounded-t-sm transition-all duration-300 ${colors.line} group-hover:opacity-80`}
                style={{
                  height: `${(item.value / maxValue) * 140}px`,
                  minHeight: item.value > 0 ? '4px' : '0px'
                }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-black/90 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  {formatLabel(item.label)}: {item.value}
                </div>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground transform -rotate-45 origin-left">
              {formatLabel(item.label)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
