import ConfigTabs from '../../components/Configuration/ConfigTabs';
import { ConfigurationProvider } from '../../Contexts/ConfigurationContext';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import './ConfigurationPage.css';

export default function ConfigurationPage() {
  return (
    <ConfigurationProvider>
      <DashboardLayout>
        <section className="configuration-shell">
          <ConfigTabs />
        </section>
      </DashboardLayout>
    </ConfigurationProvider>
  );
}
