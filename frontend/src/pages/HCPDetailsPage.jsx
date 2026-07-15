import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  MessageSquare,
  Edit,
  User,
  Activity,
  Star,
  Clock
} from 'lucide-react';

import { HCPInteractionTimeline } from '../components/hcp/HCPInteractionTimeline';
import { Loading } from '../components/common/Loading';
import { ROUTES } from '../routes/RouteConstants';

import styles from './HCPDetailsPage.module.css';

/**
 * HCPDetailsPage Component
 * Displays detailed HCP information and interaction history
 */
export const HCPDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [hcp, setHcp] = useState(null);
  const [interactions, setInteractions] = useState([]);

  // Mock data loading
  useEffect(() => {
    const loadData = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock HCP data
      const mockHcp = {
        id: id || '1',
        name: 'Dr. Sarah Chen',
        title: 'Oncologist',
        specialty: 'Oncology',
        email: 'sarah.chen@hospital.com',
        phone: '+1-555-0101',
        location: 'Boston, MA',
        organization: 'Massachusetts General Hospital',
        status: 'active',
        engagementScore: 87,
        totalInteractions: 12,
        lastInteraction: '2026-07-14T10:30:00Z',
        notes: 'Key opinion leader in oncology. Interested in clinical trials.',
        preferences: 'Prefers email communication. Available for meetings on Wednesdays.',
      };
      
      // Mock interactions
      const mockInteractions = [
        {
          id: '1',
          date: '2026-07-14T10:30:00Z',
          type: 'Meeting',
          summary: 'Discussed clinical trial results and patient enrollment',
          notes: 'Dr. Chen showed strong interest in the new oncology drug. She wants to review the full trial data before making a decision.',
          followUp: true,
          followUpDate: '2026-07-28T10:00:00Z',
        },
        {
          id: '2',
          date: '2026-07-10T14:15:00Z',
          type: 'Call',
          summary: 'Follow-up on medication adherence study',
          notes: 'Confirmed patient enrollment numbers. Scheduling next review for August.',
          followUp: false,
        },
        {
          id: '3',
          date: '2026-07-05T09:00:00Z',
          type: 'Email',
          summary: 'Shared new clinical guidelines and research papers',
          notes: 'Sent latest research publications and treatment protocols.',
          followUp: false,
        },
      ];
      
      setHcp(mockHcp);
      setInteractions(mockInteractions);
      setIsLoading(false);
    };
    
    loadData();
  }, [id]);

  const handleBack = () => {
    navigate(ROUTES.HCPS);
  };

  const handleLogInteraction = () => {
    navigate(ROUTES.INTERACTION_NEW, { state: { hcpId: id, hcpName: hcp?.name } });
  };

  const handleEditHCP = () => {
    navigate(`/hcps/${id}/edit`);
  };

  if (isLoading) {
    return <Loading fullScreen message="Loading HCP details..." />;
  }

  if (!hcp) {
    return (
      <div className={styles.notFound}>
        <h2>HCP Not Found</h2>
        <button onClick={handleBack} className={styles.backButton}>
          <ArrowLeft size={18} />
          Back to HCP List
        </button>
      </div>
    );
  }

  return (
    <div className={styles.hcpDetailsPage}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleBack}>
          <ArrowLeft size={18} />
          Back to HCPs
        </button>
        <div className={styles.headerActions}>
          <button className={styles.editButton} onClick={handleEditHCP}>
            <Edit size={16} />
            Edit Profile
          </button>
          <button className={styles.interactButton} onClick={handleLogInteraction}>
            <MessageSquare size={16} />
            Log Interaction
          </button>
        </div>
      </div>

      {/* Profile Section */}
      <div className={styles.profileSection}>
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarLarge}>
              {hcp.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div className={styles.profileInfo}>
              <h1 className={styles.profileName}>{hcp.name}</h1>
              <div className={styles.profileMeta}>
                <span className={styles.profileTitle}>{hcp.title}</span>
                <span className={styles.profileSpecialty}>{hcp.specialty}</span>
                <span className={`${styles.statusBadge} ${styles[hcp.status]}`}>
                  {hcp.status.charAt(0).toUpperCase() + hcp.status.slice(1)}
                </span>
              </div>
              <div className={styles.profileDetails}>
                <div className={styles.detailItem}>
                  <Mail size={16} />
                  <a href={`mailto:${hcp.email}`}>{hcp.email}</a>
                </div>
                <div className={styles.detailItem}>
                  <Phone size={16} />
                  <a href={`tel:${hcp.phone}`}>{hcp.phone}</a>
                </div>
                <div className={styles.detailItem}>
                  <MapPin size={16} />
                  <span>{hcp.location}</span>
                </div>
                <div className={styles.detailItem}>
                  <Activity size={16} />
                  <span>{hcp.organization}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{hcp.totalInteractions}</span>
              <span className={styles.statLabel}>Total Interactions</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statValue}>{hcp.engagementScore}%</span>
              <span className={styles.statLabel}>Engagement Score</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statValue}>
                <Clock size={16} />
              </span>
              <span className={styles.statLabel}>
                Last: {new Date(hcp.lastInteraction).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className={styles.notesSection}>
            <h4 className={styles.sectionTitle}>Notes</h4>
            <p className={styles.notesText}>{hcp.notes}</p>
          </div>

          <div className={styles.preferencesSection}>
            <h4 className={styles.sectionTitle}>Preferences</h4>
            <p className={styles.preferencesText}>{hcp.preferences}</p>
          </div>
        </div>
      </div>

      {/* Interaction Timeline */}
      <div className={styles.timelineSection}>
        <HCPInteractionTimeline 
          interactions={interactions}
          onLogInteraction={handleLogInteraction}
        />
      </div>
    </div>
  );
};

export default HCPDetailsPage;