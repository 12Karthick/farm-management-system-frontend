import { DatePicker } from 'antd';
import {
  BankOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  AppstoreOutlined,
  PushpinOutlined,
  UserSwitchOutlined,
  SolutionOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import SummaryCard from '../../components/Dashboard/SummaryCard';
import OverviewCard from '../../components/Dashboard/OverviewCard';
import StatusCard from '../../components/Dashboard/StatusCard';
import WeeklyActivityCard from '../../components/Dashboard/WeeklyActivityCard';
import RecentUpdates from '../../components/Dashboard/RecentUpdates';
import './DashboardPage.css';



// Personnel role stat cards
const personnelStats = [
  { id: 'farm-masters', label: 'Farm Masters', value: 3, icon: <UserSwitchOutlined />, iconColor: '#ec4899' },
  { id: 'farm-admins', label: 'Farm Admins', value: 5, icon: <TeamOutlined />, iconColor: '#7c3aed' },
  { id: 'farm-workers', label: 'Farm Workers', value: 42, icon: <SolutionOutlined />, iconColor: '#06b6d4' },
  { id: 'support-workers', label: 'Support Workers', value: 12, icon: <CustomerServiceOutlined />, iconColor: '#22c55e' },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      {/* Date Range Filter */}
      <div className="dashboard__search-row">
        <DatePicker.RangePicker
          id="dashboard-date-range"
          className="dashboard__range-picker"
          placeholder={['Start date', 'End date']}
          allowClear
        />
      </div>

      {/* Main summary cards row */}
      <section className="dashboard__summary-row" aria-label="Key metrics">
        <SummaryCard
          id="company"
          label="Company"
          title="AgriTech Solutions"
          // subtitle="Active Organization"
          icon={<BankOutlined />}
          variant="pink"
          showExternalLink
          animationDelay={0}
        />
        <SummaryCard
          id="farm"
          label="Farm"
          title="Green Valley Farm"
          // subtitle="8 Active Areas"
          icon={<EnvironmentOutlined />}
          variant="cyan"
          showExternalLink
          animationDelay={60}
        />
        <SummaryCard
          id="total-personnel"
          label="Total Personnel"
          title="62"
          // subtitle="+12% from last month"
          icon={<TeamOutlined />}
          variant="teal"
          // trend="+12% from last month"
          animationDelay={120}
        />
        <SummaryCard
          id="function-groups"
          label="Function Groups"
          title="15"
          // subtitle="Configured"
          icon={<AppstoreOutlined />}
          variant="purple"
          animationDelay={180}
        />
        <SummaryCard
          id="active-areas"
          label="Active Areas"
          title="8"
          // subtitle="Locations"
          icon={<PushpinOutlined />}
          variant="orange"
          showExternalLink
          animationDelay={240}
        />
      </section>

      {/* Personnel role stat cards */}
      <section className="dashboard__personnel-row" aria-label="Personnel breakdown">
        {personnelStats.map((stat) => (
          <div key={stat.id} id={`stat-${stat.id}`} className="personnel-stat-card">
            <div className="personnel-stat-card__left">
              <p className="personnel-stat-card__label">{stat.label}</p>
              <p className="personnel-stat-card__value">{stat.value}</p>
            </div>
            <div
              className="personnel-stat-card__icon"
              style={{ background: `${stat.iconColor}22`, color: stat.iconColor }}
            >
              {stat.icon}
            </div>
          </div>
        ))}
      </section>

      {/* Charts row */}
      <section className="dashboard__charts-row" aria-label="Analytics charts">
        <StatusCard />
        <OverviewCard />
      </section>

      {/* Weekly activity + Recent updates */}
      <section className="dashboard__bottom-row" aria-label="Activity overview">
        <WeeklyActivityCard />
        <RecentUpdates />
      </section>
    </DashboardLayout>
  );
}
