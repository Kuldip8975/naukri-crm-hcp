import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Calendar, MessageSquare, TrendingUp, PlusCircle } from 'lucide-react';

import { fetchInteractions, selectInteractions, selectInteractionsLoading } from '../redux/slices/interactionSlice';
import { fetchHCPs, selectHCPs, selectHCPsLoading } from '../redux/slices/hcpSlice';
import { StatCard } from '../components/dashboard/StatCard';
import { RecentInteractions } from '../components/dashboard/RecentInteractions';
import { FollowUpReminders } from '../components/dashboard/FollowUpReminders';
import { QuickActions } from '../components/dashboard/QuickActions';
import { Loading } from '../components/common/Loading';
import { ROUTES } from '../routes/RouteConstants';
import styles from './DashboardPage.module.css';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const interactions = useSelector(selectInteractions);
  const hcps = useSelector(selectHCPs);
  const interactionsLoading = useSelector(selectInteractionsLoading);
  const hcpsLoading = useSelector(selectHCPsLoading);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        dispatch(fetchInteractions({ limit: 10 })),
        dispatch(fetchHCPs({ limit: 100 })),
      ]);
      setIsLoading(false);
    };
    loadData();
  }, [dispatch]);

  // Calculate statistics
  const totalInteractions = interactions.length;
  const uniqueHCPs = new Set(interactions.map(i => i.hcpId)).size;
  const followUpsDue = interactions.filter(i => i.followUpRequired).length;
  const engagementRate = hcps.length > 0 ? Math.round((uniqueHCPs / hcps.length) * 100) : 0;

  const stats = [
    { 
      id: 1, 
      title: 'Total HCPs', 
      value: hcps.length, 
      icon: Users, 
      color: '#2563eb', 
      trend: `${hcps.length > 0 ? '+' : ''}${hcps.length}`,
      trendDirection: hcps.length > 0 ? 'up' : 'neutral' 
    },
    { 
      id: 2, 
      title: 'Interactions', 
      value: totalInteractions, 
      icon: MessageSquare, 
      color: '#7c3aed', 
      trend: `${totalInteractions > 0 ? '+' : ''}${totalInteractions}`,
      trendDirection: totalInteractions > 0 ? 'up' : 'neutral' 
    },
    { 
      id: 3, 
      title: 'Follow-ups Due', 
      value: followUpsDue, 
      icon: Calendar, 
      color: '#f59e0b', 
      trend: `${followUpsDue > 0 ? '⚠' : '✓'} ${followUpsDue}`,
      trendDirection: followUpsDue > 3 ? 'down' : 'up' 
    },
    { 
      id: 4, 
      title: 'Engagement Rate', 
      value: `${engagementRate}%`, 
      icon: TrendingUp, 
      color: '#22c55e', 
      trend: `${engagementRate}%`,
      trendDirection: engagementRate > 50 ? 'up' : 'neutral' 
    },
  ];

  // In DashboardPage.jsx, update the recentInteractions mapping:

const recentInteractions = interactions.slice(0, 5).map(i => ({
  id: i.id,
  hcpName: i.hcp_name || i.hcpName || 'Unknown HCP',  // Try both field names
  hcpSpecialty: i.hcp_specialty || i.hcpSpecialty || '',
  date: i.interaction_date || i.date || new Date().toISOString(),  // Try both field names
  type: i.interaction_type || i.type || 'other',
  summary: i.summary || i.notes?.slice(0, 100) || '',
  followUp: i.follow_up_required || i.followUp || false,
}));

  // Follow-ups
  const followUps = interactions
    .filter(i => i.followUpRequired)
    .slice(0, 3)
    .map(i => ({
      id: i.id,
      hcpName: i.hcpName || 'Unknown HCP',
      hcpSpecialty: i.hcpSpecialty || '',
      dueDate: i.followUpDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      priority: i.followUpPriority || 'medium',
      notes: i.summary || 'Follow-up required',
    }));

  if (isLoading || interactionsLoading || hcpsLoading) {
    return <Loading fullScreen message="Loading dashboard..." />;
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Welcome back! Here's what's happening with your HCP interactions.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.primaryButton} onClick={() => navigate(ROUTES.INTERACTION_NEW)}>
            <PlusCircle size={18} /> Log Interaction
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat) => <StatCard key={stat.id} {...stat} />)}
      </div>

      <QuickActions />

      <div className={styles.contentGrid}>
        <div className={styles.recentInteractions}>
          <RecentInteractions interactions={recentInteractions} onViewAll={() => navigate(ROUTES.INTERACTION_HISTORY)} />
        </div>
        <div className={styles.followUps}>
          <FollowUpReminders reminders={followUps} onViewAll={() => navigate(ROUTES.INTERACTIONS)} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
