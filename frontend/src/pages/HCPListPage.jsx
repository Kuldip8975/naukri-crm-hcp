import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, ArrowUpDown } from 'lucide-react';

import { HCPCard } from '../components/hcp/HCPCard';
import { HCPFilters } from '../components/hcp/HCPFilters';
import { Loading } from '../components/common/Loading';
import { ROUTES } from '../routes/RouteConstants';

import styles from './HCPListPage.module.css';

/**
 * HCPListPage Component
 * Displays a list of HCPs with search, filter, and sort capabilities
 */
export const HCPListPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('name');

  // Mock HCP data
  const [hcps] = useState([
    {
      id: '1',
      name: 'Dr. Sarah Chen',
      title: 'Oncologist',
      specialty: 'Oncology',
      email: 'sarah.chen@hospital.com',
      phone: '+1-555-0101',
      location: 'Boston, MA',
      lastInteraction: '2026-07-14T10:30:00Z',
      interactionCount: 12,
      status: 'active',
    },
    {
      id: '2',
      name: 'Dr. James Wilson',
      title: 'Cardiologist',
      specialty: 'Cardiology',
      email: 'james.wilson@cardiology.com',
      phone: '+1-555-0102',
      location: 'New York, NY',
      lastInteraction: '2026-07-13T14:15:00Z',
      interactionCount: 8,
      status: 'active',
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      title: 'Pediatrician',
      specialty: 'Pediatrics',
      email: 'emily.rodriguez@childrens.com',
      phone: '+1-555-0103',
      location: 'Los Angeles, CA',
      lastInteraction: '2026-07-12T09:00:00Z',
      interactionCount: 15,
      status: 'active',
    },
    {
      id: '4',
      name: 'Dr. Michael Thompson',
      title: 'Neurologist',
      specialty: 'Neurology',
      email: 'michael.thompson@neuro.com',
      phone: '+1-555-0104',
      location: 'Chicago, IL',
      lastInteraction: '2026-07-10T16:30:00Z',
      interactionCount: 6,
      status: 'inactive',
    },
    {
      id: '5',
      name: 'Dr. Lisa Park',
      title: 'Dermatologist',
      specialty: 'Dermatology',
      email: 'lisa.park@derm.com',
      phone: '+1-555-0105',
      location: 'San Francisco, CA',
      lastInteraction: '2026-07-08T11:00:00Z',
      interactionCount: 10,
      status: 'active',
    },
  ]);

  // Filter and search logic
  const filteredHCPs = hcps.filter((hcp) => {
    const matchesSearch = 
      hcp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hcp.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hcp.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Sort logic
  const sortedHCPs = [...filteredHCPs].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'lastInteraction') {
      return new Date(b.lastInteraction) - new Date(a.lastInteraction);
    } else if (sortBy === 'interactionCount') {
      return b.interactionCount - a.interactionCount;
    }
    return 0;
  });

  const handleViewHCP = (id) => {
    navigate(`/hcps/${id}`);
  };

  const handleLogInteraction = (id) => {
    navigate(ROUTES.INTERACTION_NEW, { state: { hcpId: id } });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className={styles.hcpListPage}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Healthcare Professionals</h1>
          <p className={styles.subtitle}>
            Manage and view all HCPs in your network
          </p>
        </div>
        <button
          className={styles.addButton}
          onClick={() => navigate('/hcps/create')}
        >
          <Plus size={18} />
          Add HCP
        </button>
      </div>

      {/* Search and Filters */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name, specialty, or location..."
            value={searchQuery}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button className={styles.clearSearch} onClick={handleClearSearch}>
              ✕
            </button>
          )}
        </div>
        <div className={styles.filterActions}>
          <button
            className={`${styles.filterButton} ${showFilters ? styles.active : ''}`}
            onClick={toggleFilters}
          >
            <Filter size={18} />
            Filters
          </button>
          <div className={styles.sortWrapper}>
            <ArrowUpDown size={18} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="name">Sort by Name</option>
              <option value="lastInteraction">Sort by Recent</option>
              <option value="interactionCount">Sort by Interactions</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <HCPFilters
          onClose={() => setShowFilters(false)}
          onApply={(filters) => {
            console.log('Applied filters:', filters);
            setShowFilters(false);
          }}
        />
      )}

      {/* Results */}
      {isLoading ? (
        <Loading message="Loading HCPs..." />
      ) : (
        <div className={styles.resultsSection}>
          <div className={styles.resultsHeader}>
            <span className={styles.resultCount}>
              {sortedHCPs.length} HCP{sortedHCPs.length !== 1 ? 's' : ''} found
            </span>
          </div>

          <div className={styles.hcpGrid}>
            {sortedHCPs.map((hcp) => (
              <HCPCard
                key={hcp.id}
                hcp={hcp}
                onView={handleViewHCP}
                onLogInteraction={handleLogInteraction}
              />
            ))}
          </div>

          {sortedHCPs.length === 0 && (
            <div className={styles.emptyState}>
              <p>No HCPs found matching your search.</p>
              <button className={styles.clearFiltersButton} onClick={handleClearSearch}>
                Clear search
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HCPListPage;