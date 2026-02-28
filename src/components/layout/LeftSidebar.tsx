import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MenuItem {
  label: string;
  icon: string;
  path: string;
  hasSubmenu?: boolean;
  submenuItems?: { label: string; path: string }[];
}

interface LeftSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onClose: () => void;
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: '\u{1F4CA}', path: '/dashboard' },
  { label: 'Pay Now', icon: '\u26A1', path: '/pay-now' },
  { label: 'Exchange', icon: '\u{1F504}', path: '/exchange' },
  {
    label: 'History',
    icon: '\u{1F4DC}',
    path: '/history',
    hasSubmenu: true,
    submenuItems: [
      { label: 'Payments', path: '/history/payments' },
      { label: 'Exchanges', path: '/history/convert' },
    ],
  },
];

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ collapsed, mobileOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const handleMenuClick = (item: MenuItem) => {
    if (item.hasSubmenu) {
      setOpenSubmenu(openSubmenu === item.label ? null : item.label);
    } else {
      navigate(item.path);
      onClose();
    }
  };

  const handleSubmenuClick = (path: string) => {
    navigate(path);
    onClose();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-icon">W</span>
          {!collapsed && <span className="logo-text">allet</span>}
        </div>

        <div className="sidebar-menu-area">
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.label} className={`sidebar-menu-item ${isActive(item.path) ? 'active' : ''}`}>
                <button className="sidebar-link" onClick={() => handleMenuClick(item)}>
                  <span className="menu-icon">{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span className="menu-label">{item.label}</span>
                      {item.hasSubmenu && (
                        <span className={`menu-arrow ${openSubmenu === item.label ? 'open' : ''}`}>
                          &#x203A;
                        </span>
                      )}
                    </>
                  )}
                </button>

                {item.hasSubmenu && openSubmenu === item.label && !collapsed && (
                  <ul className="sidebar-submenu">
                    {item.submenuItems?.map((sub) => (
                      <li key={sub.label}>
                        <button
                          className={`submenu-link ${isActive(sub.path) ? 'active' : ''}`}
                          onClick={() => handleSubmenuClick(sub.path)}
                        >
                          {sub.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
};
