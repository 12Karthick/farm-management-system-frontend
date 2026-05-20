import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import './OverviewCard.css';

const data = [
  { month: 'Jan', total: 45 },
  { month: 'Feb', total: 48 },
  { month: 'Mar', total: 50 },
  { month: 'Apr', total: 55 },
  { month: 'May', total: 62 },
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{label}</p>
      <p className="chart-tooltip__value">{payload[0].value} personnel</p>
    </div>
  );
}

export default function OverviewCard() {
  return (
    <div className="overview-card" id="personnel-growth-chart">
      <h3 className="overview-card__title">Personnel Growth Trend</h3>
      <div className="overview-card__chart">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="gradGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 70]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(6,182,212,0.3)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#06b6d4"
              strokeWidth={2.5}
              fill="url(#gradGrowth)"
              dot={false}
              activeDot={{ r: 5, fill: '#06b6d4', stroke: '#0d1117', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
