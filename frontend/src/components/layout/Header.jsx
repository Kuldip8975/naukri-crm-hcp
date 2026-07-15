import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Menu, LogOut, User, Settings, Bell } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../redux/slices/authSlice';
import { ROUTES } from '../../routes/RouteConstants';

import styles from './Header.module.css';

/**
 * Header Component
 * Top navigation bar with menu toggle, user info, and actions
 */
export const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

  const handleProfile = () => {
    navigate(ROUTES.SETTINGS_PROFILE || '/settings/profile');
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button
          className={styles.menuButton}
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        <div className={styles.brand}>
          <h1 className={styles.brandTitle}>Naukri CRM</h1>
          <span className={styles.brandSubtitle}>HCP Module</span>
        </div>
      </div>

      <div className={styles.headerRight}>
        {/* Notifications */}
        <button className={styles.iconButton} aria-label="Notifications">
          <Bell size={20} />
          <span className={styles.notificationBadge}>3</span>
        </button>

        {/* User Info */}
        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.fullName || 'User'}</span>
            <span className={styles.userRole}>{user?.role || 'Sales Rep'}</span>
          </div>
          <div className={styles.userAvatar}>
            {user?.fullName?.charAt(0) || 'U'}
          </div>
        </div>

        {/* Profile Dropdown */}
        <div className={styles.dropdown}>
          <button className={styles.dropdownButton} aria-label="User menu">
            <User size={20} />
          </button>
          <div className={styles.dropdownMenu}>
            <button className={styles.dropdownItem} onClick={handleProfile}>
              <User size={16} />
              Profile
            </button>
            <button className={styles.dropdownItem} onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;