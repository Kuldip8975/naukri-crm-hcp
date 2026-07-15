import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, FormInput, ArrowLeft } from 'lucide-react';

import InteractionForm from '../components/interactions/InteractionForm';
import ChatInterface from '../components/interactions/ChatInterface';  // <-- Changed to default import
import { ROUTES } from '../routes/RouteConstants';

import styles from './LogInteractionPage.module.css';

export const LogInteractionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState('form');
  const [selectedHCP, setSelectedHCP] = useState(null);

  useEffect(() => {
    if (location.state?.hcpId) {
      setSelectedHCP({
        id: location.state.hcpId,
        name: location.state.hcpName || 'Selected HCP',
      });
    }
  }, [location.state]);

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
  };

  const handleSuccess = () => {
    navigate(ROUTES.INTERACTION_HISTORY);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className={styles.logInteractionPage}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backButton} onClick={handleCancel}>
            <ArrowLeft size={20} />
            Back
          </button>
          <div>
            <h1 className={styles.title}>Log Interaction</h1>
            {selectedHCP && (
              <p className={styles.subtitle}>
                Logging interaction with: <strong>{selectedHCP.name}</strong>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={styles.modeToggle}>
        <button
          className={`${styles.modeButton} ${mode === 'form' ? styles.active : ''}`}
          onClick={() => handleModeSwitch('form')}
        >
          <FormInput size={18} />
          Form Mode
        </button>
        <button
          className={`${styles.modeButton} ${mode === 'chat' ? styles.active : ''}`}
          onClick={() => handleModeSwitch('chat')}
        >
          <MessageSquare size={18} />
          AI Chat Mode
        </button>
      </div>

      <div className={styles.content}>
        {mode === 'form' ? (
          <InteractionForm
            initialHCP={selectedHCP}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        ) : (
          <ChatInterface
            initialHCP={selectedHCP}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default LogInteractionPage;