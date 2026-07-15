import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

import styles from './MainLayout.module.css';

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={styles.mainLayout}>
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div className={`${styles.mainContent} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <Header onMenuClick={toggleSidebar} />
        <main className={styles.contentArea}>
          <div className={styles.contentWrapper}>
            <Outlet />  {/* <-- This must be here to render child routes */}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;