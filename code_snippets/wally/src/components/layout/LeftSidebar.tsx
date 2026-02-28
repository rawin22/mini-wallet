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
  { label: 'Dashboard', icon: '📊', path: '/dashboard' },
  { label: 'Withdraw', icon: '💸', path: '/withdraw' },
  { label: 'Deposit', icon: '💰', path: '/deposit' },
  { label: 'Pay Now', icon: '⚡', path: '/pay-now' },
  { label: 'Payment Wizard', icon: '🪄', path: '/payment-wizard' },
  { label: 'Receive', icon: '📥', path: '/receive' },
  {
    label: 'History',
    icon: '📜',
    path: '/history',
    hasSubmenu: true,
    submenuItems: [
      { label: 'Payments', path: '/history/payments' },
      { label: 'Convert', path: '/history/convert' },
    ],
  },
  { label: 'Balances', icon: '💵', path: '/balances' },
  {
    label: 'Add Funds',
    icon: '➕',
    path: '/add-funds',
    hasSubmenu: true,
    submenuItems: [
      { label: 'Bank Account', path: '/add-funds/bank' },
      { label: 'Deposit Proof', path: '/add-funds/proof' },
      { label: 'Deposit History', path: '/add-funds/history' },
    ],
  },
  { label: 'Exchange', icon: '🔄', path: '/exchange' },
  { label: 'Contact Us', icon: '📧', path: '/contact' },
];

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  collapsed,
  mobileOpen,
  onClose,
}) => {
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

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-icon">W</span>
          {!collapsed && <span className="logo-text">instant</span>}
        </div>

        <div className="sidebar-menu-area">
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li
                key={item.label}
                className={`sidebar-menu-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <button
                  className="sidebar-link"
                  onClick={() => handleMenuClick(item)}
                >
                  <span className="menu-icon">{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span className="menu-label">{item.label}</span>
                      {item.hasSubmenu && (
                        <span className={`menu-arrow ${openSubmenu === item.label ? 'open' : ''}`}>
                          ›
                        </span>
                      )}
                    </>
                  )}
                </button>

                {item.hasSubmenu && openSubmenu === item.label && !collapsed && (
                  <ul className="sidebar-submenu">
                    {item.submenuItems?.map((subItem) => (
                      <li key={subItem.label}>
                        <button
                          className={`submenu-link ${isActive(subItem.path) ? 'active' : ''}`}
                          onClick={() => handleSubmenuClick(subItem.path)}
                        >
                          {subItem.label}
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
