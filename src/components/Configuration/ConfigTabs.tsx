import CompanyTab from './CompanyTab';
import FarmTab from './FarmTab';
import AreasTab from './AreasTab';
import FarmAdminsTab from './FarmAdminsTab';
import FarmMastersTab from './FarmMastersTab';
import FarmWorkersTab from './FarmWorkersTab';
import FunctionGroupsTab from './FunctionGroupsTab';
import SupportWorkersTab from './SupportWorkersTab';
import { Tabs } from 'antd';

const TAB_ITEMS = [
  { key: 'company',         label: 'Company',         children: <CompanyTab /> },
  { key: 'farm',            label: 'Farm',            children: <FarmTab /> },
  { key: 'areas',           label: 'Areas',           children: <AreasTab /> },
  { key: 'function-groups', label: 'Function Groups', children: <FunctionGroupsTab /> },
  { key: 'farm-masters',    label: 'Farm Masters',    children: <FarmMastersTab /> },
  { key: 'farm-admins',     label: 'Farm Admins',     children: <FarmAdminsTab /> },
  { key: 'farm-workers',    label: 'Farm Workers',    children: <FarmWorkersTab /> },
  { key: 'support-workers', label: 'Support Workers', children: <SupportWorkersTab /> },
];

export default function ConfigTabs() {
  return (
    <Tabs
      defaultActiveKey="company"
      items={TAB_ITEMS}
      className="configuration-tabs"
      destroyInactiveTabPane={false}
    />
  );
}

