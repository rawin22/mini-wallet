import React, { useState } from 'react';
import { TopNavBar } from './TopNavBar.tsx';
import { LeftSidebar } from './LeftSidebar.tsx';
import '../../styles/Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      <TopNavBar
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onToggleMobileSidebar={() => setSidebarMobileOpen(!sidebarMobileOpen)}
      />
      <div className="app-body">
        <LeftSidebar
          collapsed={sidebarCollapsed}
          mobileOpen={sidebarMobileOpen}
          onClose={() => setSidebarMobileOpen(false)}
        />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};
