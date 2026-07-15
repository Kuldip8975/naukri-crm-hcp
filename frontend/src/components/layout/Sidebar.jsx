import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  History,
  BarChart3,
  MessageSquare,
  Settings,
  X,
} from 'lucide-react';

import { ROUTES } from '../../routes/RouteConstants';
import styles from './Sidebar.module.css';

export const Sidebar = ({ isOpen, onToggle }) => {
  const iconMap = {
    LayoutDashboard,
    Users,
    ClipboardList,
    History,
    BarChart3,
    MessageSquare,
    Settings,
  };

  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent size={20} /> : null;
  };

  const navItems = [
    { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: 'LayoutDashboard' },
    { label: 'HCPs', path: ROUTES.HCPS, icon: 'Users' },
    { 
      label: 'Interactions', 
      path: ROUTES.INTERACTION_NEW,  // Goes to Log Interaction page
      icon: 'ClipboardList' 
    },
    { 
      label: 'History', 
      path: ROUTES.INTERACTION_HISTORY, 
      icon: 'History' 
    },
    { label: 'Analytics', path: ROUTES.ANALYTICS, icon: 'BarChart3' },
    { label: 'Chat', path: ROUTES.CHAT, icon: 'MessageSquare' },
    { label: 'Settings', path: ROUTES.SETTINGS, icon: 'Settings' },
  ];

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onToggle} />}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
        <button className={styles.closeButton} onClick={onToggle} aria-label="Close sidebar">
          <X size={24} />
        </button>

        <div className={styles.logo}>
          <div className={styles.logoIcon}>N</div>
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>Naukri CRM</span>
            <span className={styles.logoSubtitle}>HCP Module</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.navIcon}>{getIcon(item.icon)}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.bottomSection}>
          <div className={styles.version}>
            <span>Version 1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;