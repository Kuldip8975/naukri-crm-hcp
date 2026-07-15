import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Send, Mic, User, Bot, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';

import styles from './ChatInterface.module.css';

export const ChatInterface = ({ initialHCP, onSuccess, onCancel }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const greeting = `Hello! I'm your AI assistant. ${initialHCP ? `Let's log an interaction with ${initialHCP.name}. ` : ''}Please describe your interaction with the HCP in your own words.`;
    
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: greeting,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [initialHCP]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageContent = inputValue.trim();
    setInputValue('');
    setIsProcessing(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        toast.error('Please login first');
        setIsProcessing(false);
        return;
      }

      console.log('Sending message:', messageContent);
      console.log('Token:', token);

      // Make API call to backend
      const response = await fetch('http://localhost:8000/api/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: messageContent,
          session_id: 'chat-' + Date.now(),
          context: { hcpName: initialHCP?.name },
        }),
      });

      console.log('Response status:', response.status);

      const result = await response.json();
      console.log('Response data:', result);

      if (result.success) {
        let responseText = result.response || 'I received your message.';
        
        // If interaction was logged, show success
        if (result.interaction) {
          responseText = `✅ ${responseText}`;
        }
        
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseText,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMessage]);

        if (result.interaction) {
          toast.success('✅ Interaction logged successfully!');
          setTimeout(() => onSuccess(), 2000);
        }
      } else {
        throw new Error(result.response || result.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error.message || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Only show toast for network errors, not for "Failed to get response"
      if (error.message !== 'Failed to get response') {
        toast.error(error.message || 'Failed to process message');
      }
    } finally {
      setIsProcessing(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { label: '📅 Log Meeting', text: 'I met with Dr. Sarah Chen today to discuss the clinical trial results.' },
    { label: '📞 Log Call', text: 'I spoke with the HCP on a call about medication adherence.' },
    { label: '📧 Log Email', text: 'I sent an email to the HCP regarding the new guidelines.' },
    { label: '📋 Schedule Follow-up', text: 'I need to schedule a follow-up with Dr. Chen for next week.' },
    { label: '❓ Help', text: 'What can you help me with?' },
  ];

  return (
    <div className={`${styles.chatInterface} ${isExpanded ? styles.expanded : styles.collapsed}`}>
      <div className={styles.chatHeader}>
        <div className={styles.chatHeaderInfo}>
          <div className={styles.aiAvatar}><Bot size={20} /></div>
          <div>
            <span className={styles.chatTitle}>AI Assistant</span>
            <span className={styles.chatStatus}>
              {isProcessing ? 'Thinking...' : 'Online'}
            </span>
          </div>
        </div>
        <button className={styles.expandButton} onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
      </div>

      <div className={styles.messagesContainer}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${message.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
          >
            <div className={styles.messageAvatar}>
              {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={styles.messageContent}>
              <div className={styles.messageText}>{message.content}</div>
              <div className={styles.messageTime}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className={`${styles.message} ${styles.assistantMessage}`}>
            <div className={styles.messageAvatar}><Bot size={16} /></div>
            <div className={styles.messageContent}>
              <div className={styles.typingIndicator}>
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {isExpanded && (
        <div className={styles.quickActions}>
          {quickActions.map((action) => (
            <button
              key={action.label}
              className={styles.quickActionButton}
              onClick={() => setInputValue(action.text)}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      <div className={styles.chatInput}>
        <textarea
          ref={inputRef}
          className={styles.inputArea}
          placeholder="Describe your interaction or ask a question..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={1}
          disabled={isProcessing}
        />
        <div className={styles.inputActions}>
          <button className={styles.voiceButton} onClick={() => toast.info('Voice input coming soon!')}>
            <Mic size={20} />
          </button>
          <button
            className={styles.sendButton}
            onClick={handleSend}
            disabled={!inputValue.trim() || isProcessing}
          >
            {isProcessing ? <Loader size={20} className={styles.spinning} /> : <Send size={20} />}
          </button>
        </div>
      </div>

      <div className={styles.chatFooter}>
        <button className={styles.cancelButton} onClick={onCancel}>Cancel</button>
        <button 
          className={styles.saveButton} 
          onClick={() => {
            toast.info('Please log an interaction using the chat above.');
          }}
          disabled={messages.length <= 1}
        >
          Save & Complete
        </button>
      </div>
    </div>
  );
};

ChatInterface.propTypes = {
  initialHCP: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  }),
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ChatInterface;