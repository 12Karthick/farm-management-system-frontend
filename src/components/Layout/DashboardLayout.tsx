import type { ReactNode } from 'react';
import PageContainer from '../Layout/PageContainer';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <PageContainer className="dashboard-layout">
      {children}
    </PageContainer>
  );
}
