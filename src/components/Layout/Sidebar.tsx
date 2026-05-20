import { NavLink, useLocation } from 'react-router-dom';
import {
    DashboardOutlined,
    // TeamOutlined,
    // EnvironmentOutlined,
    // AppstoreOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import './Sidebar.css';

const navItems = [
    { path: '/dashboard', label: 'Overview', icon: <DashboardOutlined /> },
    // { path: '/personnel', label: 'Personnel', icon: <TeamOutlined /> },
    // { path: '/areas', label: 'Areas', icon: <EnvironmentOutlined /> },
    // { path: '/function-groups', label: 'Function Groups', icon: <AppstoreOutlined /> },
    { path: '/configuration', label: 'Configuration', icon: <SettingOutlined /> },
];

export default function Sidebar() {
    const location = useLocation();

    return (
        <aside className="sidebar">
            {/* Brand */}
            <div className="sidebar__brand">
                <span className="sidebar__brand-name">Farm Management</span>
                <span className="sidebar__brand-sub">Dashboard</span>
            </div>

            {/* Navigation */}
            <nav className="sidebar__nav">
                <ul className="sidebar__nav-list">
                    {navItems.map(({ path, label, icon }) => {
                        const isActive =
                            location.pathname === path ||
                            location.pathname.startsWith(path + '/');
                        return (
                            <li key={path}>
                                <NavLink
                                    to={path}
                                    className={`sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`}
                                    title={label}
                                >
                                    <span className="sidebar__nav-icon">{icon}</span>
                                    <span className="sidebar__nav-label">{label}</span>
                                    {isActive && <span className="sidebar__nav-bar" />}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Config Status */}
            {/* <div className="sidebar__footer">
        <div className="sidebar__config-status">
          <div className="sidebar__config-header">
            <span className="sidebar__config-label">Config Status</span>
            <SettingOutlined className="sidebar__config-icon" />
          </div>
          <Tooltip title="95% configured" placement="right">
            <Progress
              percent={95}
              showInfo={false}
              size="small"
              strokeColor={{ from: '#9333ea', to: '#ec4899' }}
              trailColor="rgba(255,255,255,0.08)"
            />
          </Tooltip>
          <span className="sidebar__config-pct">95%</span>
        </div>
      </div> */}
        </aside>
    );
}
