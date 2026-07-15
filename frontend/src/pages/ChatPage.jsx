import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Mic, 
  User, 
  Bot, 
  Loader, 
  Plus, 
  MessageSquare,
  X,
  ChevronLeft
} from 'lucide-react';
import { toast } from 'react-toastify';

import { ROUTES } from '../routes/RouteConstants';
import styles from './ChatPage.module.css';

/**
 * ChatPage Component
 * Full-page chat interface for AI interactions
 */
export const ChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessions, setSessions] = useState([
    { id: '1', title: 'Dr. Sarah Chen - Clinical Trial', timestamp: '2026-07-14T10:30:00Z' },
    { id: '2', title: 'Dr. James Wilson - Follow-up', timestamp: '2026-07-13T14:15:00Z' },
    { id: '3', title: 'General Questions', timestamp: '2026-07-12T09:00:00Z' },
  ]);
  const [activeSession, setActiveSession] = useState(null);
  const [showSessions, setShowSessions] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initial greeting
  useEffect(() => {
    if (!activeSession && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Hello! I\'m your AI assistant for HCP interactions. I can help you log interactions, schedule follow-ups, search for HCPs, and answer any questions you have. How can I help you today?',
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [activeSession]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mock AI response
  const generateAIResponse = async (userMessage) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const lower = userMessage.toLowerCase();
    if (lower.includes('meeting') || lower.includes('met')) {
      return `Great! I'll help you log this meeting. Could you tell me which HCP you met with, the topics discussed, and any key takeaways?`;
    } else if (lower.includes('follow up') || lower.includes('follow-up')) {
      return `I'll schedule a follow-up for you. Which HCP would you like to follow up with, and when would you like the follow-up?`;
    } else if (lower.includes('search') || lower.includes('find')) {
      return `I'll help you search for HCPs. What specialty or location are you looking for?`;
    } else if (lower.includes('thank') || lower.includes('thanks')) {
      return `You're welcome! Is there anything else I can help you with today?`;
    } else if (lower.includes('save') || lower.includes('done')) {
      return `✅ Interaction saved successfully! You can view it in your history. Would you like to log another interaction?`;
    } else {
      return `I understand. Could you provide more details about what you'd like to do? I can help with logging interactions, scheduling follow-ups, searching HCPs, or answering general questions.`;
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    try {
      const response = await generateAIResponse(userMessage.content);
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Failed to process your message. Please try again.');
      console.error('Chat error:', error);
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

  const handleNewChat = () => {
    setActiveSession(null);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Starting a new conversation! How can I help you today?',
        timestamp: new Date().toISOString(),
      },
    ]);
    setShowSessions(false);
  };

  const handleSelectSession = (session) => {
    setActiveSession(session);
    setMessages([
      {
        id: 'session',
        role: 'assistant',
        content: `Continuing conversation: ${session.title}`,
        timestamp: new Date().toISOString(),
      },
    ]);
    setShowSessions(false);
  };

  const handleBackToDashboard = () => {
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <div className={styles.chatPage}>
      {/* Sidebar - Sessions */}
      <div className={`${styles.sidebar} ${showSessions ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <h3 className={styles.sidebarTitle}>Conversations</h3>
          <button className={styles.newChatButton} onClick={handleNewChat}>
            <Plus size={18} />
            New Chat
          </button>
        </div>
        <div className={styles.sessionList}>
          {sessions.map((session) => (
            <button
              key={session.id}
              className={`${styles.sessionItem} ${activeSession?.id === session.id ? styles.active : ''}`}
              onClick={() => handleSelectSession(session)}
            >
              <MessageSquare size={16} />
              <div className={styles.sessionInfo}>
                <div className={styles.sessionTitle}>{session.title}</div>
                <div className={styles.sessionTime}>
                  {new Date(session.timestamp).toLocaleDateString()}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={styles.mainArea}>
        {/* Header */}
        <div className={styles.chatHeader}>
          <div className={styles.chatHeaderLeft}>
            <button 
              className={styles.menuButton}
              onClick={() => setShowSessions(!showSessions)}
            >
              <MessageSquare size={20} />
            </button>
            <button 
              className={styles.backButton}
              onClick={handleBackToDashboard}
            >
              <ChevronLeft size={20} />
              Dashboard
            </button>
            <div className={styles.chatInfo}>
              <span className={styles.chatTitle}>
                {activeSession ? activeSession.title : 'New Conversation'}
              </span>
              <span className={styles.chatStatus}>
                {isProcessing ? 'AI is typing...' : 'Online'}
              </span>
            </div>
          </div>
          <button className={styles.closeButton} onClick={handleBackToDashboard}>
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className={styles.messagesContainer}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.message} ${
                message.role === 'user' ? styles.userMessage : styles.assistantMessage
              }`}
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
              <div className={styles.messageAvatar}>
                <Bot size={16} />
              </div>
              <div className={styles.messageContent}>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={styles.chatInput}>
          <textarea
            ref={inputRef}
            className={styles.inputArea}
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
            disabled={isProcessing}
          />
          <div className={styles.inputActions}>
            <button
              className={styles.voiceButton}
              onClick={() => toast.info('Voice input coming soon!')}
            >
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
      </div>
    </div>
  );
};

export default ChatPage;