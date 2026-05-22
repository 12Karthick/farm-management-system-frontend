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
import { useGetDashboardSummaryQuery } from '../../api/endpoints/dashboardApi';
import './DashboardPage.css';

export default function DashboardPage() {
  const { data: dashboardData, isLoading } = useGetDashboardSummaryQuery();

  const personnelStats = [
    { id: 'farm-masters', label: 'Farm Masters', value: dashboardData?.farmMasters ?? 3, icon: <UserSwitchOutlined />, iconColor: '#ec4899' },
    { id: 'farm-admins', label: 'Farm Admins', value: dashboardData?.farmAdmins ?? 5, icon: <TeamOutlined />, iconColor: '#7c3aed' },
    { id: 'farm-workers', label: 'Farm Workers', value: dashboardData?.farmWorkers ?? 42, icon: <SolutionOutlined />, iconColor: '#06b6d4' },
    { id: 'support-workers', label: 'Support Workers', value: dashboardData?.supportWorkers ?? 12, icon: <CustomerServiceOutlined />, iconColor: '#22c55e' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="dashboard__loading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>Loading AgriTech Dashboard...</span>
        </div>
      </DashboardLayout>
    );
  }

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
          // title={dashboardData?.companyName || "AgriTech Solutions"}
          title={dashboardData?.totalCompanies.toString() || "0"}
          subtitle={`Companies Registered`}
          icon={<BankOutlined />}
          variant="pink"
          // showExternalLink
          animationDelay={0}
        />
        <SummaryCard
          id="farm"
          label="Farm"
          // title={dashboardData?.farmName || "Green Valley Farm"}
          title={dashboardData?.totalFarms.toString() || "0"}
          subtitle={`Farms Registered`}
          icon={<EnvironmentOutlined />}
          variant="cyan"
          // showExternalLink
          animationDelay={60}
        />
        <SummaryCard
          id="function-groups"
          label="Function Groups"
          title={String(dashboardData?.totalFunctionGroups ?? 15)}
          subtitle="Configured Groups"
          icon={<AppstoreOutlined />}
          variant="purple"
          animationDelay={180}
        />
        <SummaryCard
          id="active-areas"
          label="Active Areas"
          title={String(dashboardData?.totalAreas ?? 8)}
          subtitle="Physical Areas"
          icon={<PushpinOutlined />}
          variant="orange"
          // showExternalLink
          animationDelay={240}
        />
        <SummaryCard
          id="total-personnel"
          label="Total Personnel"
          title={String(dashboardData?.totalPersonnel ?? 62)}
          subtitle="Personnel Registered"
          icon={<TeamOutlined />}
          variant="teal"
          animationDelay={120}
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
        <StatusCard data={dashboardData} />
        <OverviewCard trend={dashboardData?.personnelGrowthTrend} />
      </section>

      {/* Weekly activity + Recent updates */}
      <section className="dashboard__bottom-row" aria-label="Activity overview">
        <WeeklyActivityCard />
        <RecentUpdates />
      </section>
    </DashboardLayout>
  );
}
