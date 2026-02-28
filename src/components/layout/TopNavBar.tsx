import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.ts';

interface TopNavBarProps {
  onToggleSidebar: () => void;
  onToggleMobileSidebar: () => void;
}

const THEME_KEY = 'app_theme';

export const TopNavBar: React.FC<TopNavBarProps> = ({ onToggleSidebar, onToggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar-header">
      <div className="navbar-left">
        <button className="sidebar-toggle desktop-only" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <button className="sidebar-mobile-toggle mobile-only" onClick={onToggleMobileSidebar} aria-label="Toggle mobile menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <img
          src={theme === 'dark' ? '/winstantpay-logo-light.png' : '/winstantpay-logo.png'}
          alt="WinstantPay"
          className="navbar-brand-logo"
        />
      </div>

      <div className="navbar-right">
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
              <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>

        <div className="user-menu-container">
          <button className="user-profile-btn" onClick={() => setShowUserMenu(!showUserMenu)} aria-label="User menu">
            <div className="user-avatar">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <div className="user-avatar-large">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className="user-info">
                  <div className="user-name">{user?.firstName} {user?.lastName}</div>
                  <div className="user-email">{user?.emailAddress}</div>
                </div>
              </div>
              <div className="user-dropdown-divider" />
              <ul className="user-dropdown-menu">
                <li><a href="#" onClick={handleLogout} className="logout-link">Log Out</a></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
