import type { ReactNode } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import './MainLayout.css';

interface MainLayoutProps {
  children: ReactNode;
  organizationName?: string;
  farmName?: string;
}

export default function MainLayout({ children, organizationName, farmName }: MainLayoutProps) {
  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-layout__content">
        <Header organizationName={organizationName} farmName={farmName} />
        {children}
      </div>
    </div>
  );
}
