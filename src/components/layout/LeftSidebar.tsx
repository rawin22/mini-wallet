import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage.ts';

interface MenuItem {
  id: string;
  labelKey: string;
  icon: string;
  path: string;
  hasSubmenu?: boolean;
  submenuItems?: { id: string; labelKey: string; path: string }[];
}

interface LeftSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onClose: () => void;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', labelKey: 'nav.dashboard', icon: '\u{1F4CA}', path: '/dashboard' },
  { id: 'pay-now', labelKey: 'nav.payNow', icon: '\u26A1', path: '/pay-now' },
  { id: 'exchange', labelKey: 'nav.exchange', icon: '\u{1F504}', path: '/exchange' },
  {
    id: 'history',
    labelKey: 'nav.history',
    icon: '\u{1F4DC}',
    path: '/history',
    hasSubmenu: true,
    submenuItems: [
      { id: 'payments', labelKey: 'nav.payments', path: '/history/payments' },
      { id: 'exchanges', labelKey: 'nav.exchanges', path: '/history/convert' },
    ],
  },
];

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ collapsed, mobileOpen, onClose }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const handleMenuClick = (item: MenuItem) => {
    if (item.hasSubmenu) {
      setOpenSubmenu(openSubmenu === item.id ? null : item.id);
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
              <li key={item.id} className={`sidebar-menu-item ${isActive(item.path) ? 'active' : ''}`}>
                <button className="sidebar-link" onClick={() => handleMenuClick(item)}>
                  <span className="menu-icon">{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span className="menu-label">{t(item.labelKey)}</span>
                      {item.hasSubmenu && (
                        <span className={`menu-arrow ${openSubmenu === item.id ? 'open' : ''}`}>
                          &#x203A;
                        </span>
                      )}
                    </>
                  )}
                </button>

                {item.hasSubmenu && openSubmenu === item.id && !collapsed && (
                  <ul className="sidebar-submenu">
                    {item.submenuItems?.map((sub) => (
                      <li key={sub.id}>
                        <button
                          className={`submenu-link ${isActive(sub.path) ? 'active' : ''}`}
                          onClick={() => handleSubmenuClick(sub.path)}
                        >
                          {t(sub.labelKey)}
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
