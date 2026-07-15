import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Filter, ArrowUpDown, Plus, Calendar } from 'lucide-react';

import {
  fetchInteractions,
  selectInteractions,
  selectInteractionsLoading,
  selectInteractionFilters,
  setFilters,
} from '../redux/slices/interactionSlice';
import { InteractionCard } from '../components/interactions/InteractionCard';
import { Loading } from '../components/common/Loading';
import { ROUTES } from '../routes/RouteConstants';
import styles from './InteractionHistoryPage.module.css';

export const InteractionHistoryPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const interactions = useSelector(selectInteractions);
  const isLoading = useSelector(selectInteractionsLoading);
  const filters = useSelector(selectInteractionFilters);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    dispatch(fetchInteractions(filters));
  }, [dispatch, filters]);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    dispatch(setFilters({ searchQuery: query }));
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    dispatch(setFilters({ type: type === 'all' ? null : type }));
  };

  const handleViewInteraction = (id) => {
    navigate(`/interactions/${id}`);
  };

  const handleEditInteraction = (id) => {
    navigate(`/interactions/${id}/edit`);
  };

  // Map backend field names to frontend expected field names
  const mapInteraction = (interaction) => ({
    id: interaction.id,
    hcpName: interaction.hcp_name || interaction.hcpName || 'Unknown HCP',
    hcpSpecialty: interaction.hcp_specialty || interaction.hcpSpecialty || '',
    date: interaction.interaction_date || interaction.date,
    type: interaction.interaction_type || interaction.type || 'other',
    summary: interaction.summary || '',
    notes: interaction.notes || '',
    followUp: interaction.follow_up_required || interaction.followUp || false,
    followUpDate: interaction.follow_up_date || interaction.followUpDate || null,
  });

  const mappedInteractions = (interactions || []).map(mapInteraction);

  if (isLoading) {
    return <Loading message="Loading interactions..." />;
  }

  return (
    <div className={styles.historyPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Interaction History</h1>
          <p className={styles.subtitle}>View and manage all your HCP interactions</p>
        </div>
        <button className={styles.logButton} onClick={() => navigate(ROUTES.INTERACTION_NEW)}>
          <Plus size={18} /> Log New
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search interactions..."
            value={searchQuery}
            onChange={handleSearch}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterControls}>
          <div className={styles.filterGroup}>
            <Filter size={18} />
            <select value={filterType} onChange={(e) => handleFilterChange(e.target.value)} className={styles.filterSelect}>
              <option value="all">All Types</option>
              <option value="meeting">Meetings</option>
              <option value="call">Calls</option>
              <option value="email">Emails</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <ArrowUpDown size={18} />
            <select className={styles.filterSelect}>
              <option value="date">Sort by Date</option>
              <option value="hcp">Sort by HCP</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.results}>
        <div className={styles.resultCount}>
          {mappedInteractions.length} interaction{mappedInteractions.length !== 1 ? 's' : ''} found
        </div>

        <div className={styles.interactionList}>
          {mappedInteractions.map((interaction) => (
            <InteractionCard
              key={interaction.id}
              interaction={interaction}
              onView={handleViewInteraction}
              onEdit={handleEditInteraction}
            />
          ))}
        </div>

        {mappedInteractions.length === 0 && (
          <div className={styles.emptyState}>
            <p>No interactions found.</p>
            <button className={styles.logButton} onClick={() => navigate(ROUTES.INTERACTION_NEW)}>
              Log your first interaction
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractionHistoryPage;