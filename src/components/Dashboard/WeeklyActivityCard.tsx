import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import './WeeklyActivityCard.css';

const weekData = [
  { day: 'Mon', count: 12 },
  { day: 'Tue', count: 18 },
  { day: 'Wed', count: 25 },
  { day: 'Thu', count: 22 },
  { day: 'Fri', count: 28 },
  { day: 'Sat', count: 15 },
  { day: 'Sun', count: 10 },
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bar-tooltip">
      <p className="bar-tooltip__label">{label}</p>
      <p className="bar-tooltip__value">{payload[0].value} activities</p>
    </div>
  );
}

export default function WeeklyActivityCard() {
  return (
    <div className="weekly-activity" id="weekly-activity-chart">
      <h3 className="weekly-activity__title">Weekly Activity Overview</h3>
      <div className="weekly-activity__chart">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weekData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {weekData.map((_, i) => (
                <Cell key={i} fill="#22c55e" fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
