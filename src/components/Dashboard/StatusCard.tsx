import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import './StatusCard.css';

const roleData = [
  { name: 'Masters', value: 3, color: '#ec4899' },
  { name: 'Admins', value: 5, color: '#a855f7' },
  { name: 'Workers', value: 42, color: '#06b6d4' },
  { name: 'Support', value: 12, color: '#22c55e' },
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}

function DonutTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="donut-tooltip">
      <span className="donut-tooltip__dot" style={{ background: item.payload.color }} />
      <span>{item.name}: </span>
      <strong>{item.value}</strong>
    </div>
  );
}

export default function StatusCard() {
  const total = roleData.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="status-card" id="role-distribution-chart">
      <h3 className="status-card__title">Role Distribution</h3>

      <div className="status-card__chart-wrap">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={roleData}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {roleData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="status-card__center">
          <span className="status-card__center-value">{total}</span>
          <span className="status-card__center-label">Total</span>
        </div>
      </div>

      {/* Legend grid */}
      <div className="status-card__legend">
        {roleData.map((item) => (
          <div key={item.name} className="status-card__legend-item">
            <span className="status-card__legend-dot" style={{ background: item.color }} />
            <span className="status-card__legend-name">{item.name}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
