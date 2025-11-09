/**
 * ChatScreen.jsx - Liquid Glass WhatsApp-Style Chat
 * Modern glassmorphism design with WWDC 2025 inspiration
 * Keyboard-aware layout for iOS/Android
 */

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Image, Mic } from 'lucide-react';
import MistralProvider from '../../ai/MistralProvider';
import characterPrompts from '../../data/characterPrompts';
import './ChatScreen.css';

const ChatScreen = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [character, setCharacter] = useState(null);
  const [relationshipLevel, setRelationshipLevel] = useState(10);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const aiProvider = useRef(null);

  // Initialize AI and character
  useEffect(() => {
    const initializeChat = async () => {
      // Find character by ID
      const foundCharacter = characterPrompts.find((char, index) => index === parseInt(id));
      if (foundCharacter) {
        setCharacter(foundCharacter);
        
        // Initialize Mistral AI
        aiProvider.current = new MistralProvider();
        try {
          await aiProvider.current.initialize();
          
          // Send welcome message
          setTimeout(() => {
            addMessage({
              text: getWelcomeMessage(foundCharacter),
              sender: 'character',
              timestamp: new Date()
            });
          }, 1000);
        } catch (error) {
          console.error('AI initialization failed:', error);
        }
      }
    };

    initializeChat();
  }, [id]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getWelcomeMessage = (char) => {
    const welcomes = {
      Cheerful: `Heyy! 😊 Nasılsın? ${char.name} burada!`,
      shy: `A-ah... merhaba 😳 Ben ${char.name}...`,
      confident: `Hey! Ben ${char.name}. Seninle tanışmak güzel! 😉`,
      playful: `Hiii~ 💕 ${char.name} here! Ne yapıyorsun? 🎵`
    };
    
    return welcomes[char.mood] || `Merhaba! Ben ${char.name} 😊`;
  };

  const addMessage = (message) => {
    setMessages(prev => [...prev, { ...message, id: Date.now() }]);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !character || !aiProvider.current) return;

    const userMessage = {
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    addMessage(userMessage);
    setInputText('');
    setIsTyping(true);

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    try {
      // Generate AI response
      const response = await aiProvider.current.generate(inputText, {
        ...character,
        relationshipLevel,
        mood: character.mood
      });

      const characterMessage = {
        text: response,
        sender: 'character',
        timestamp: new Date()
      };

      addMessage(characterMessage);
      
      // Increase relationship level
      setRelationshipLevel(prev => Math.min(100, prev + 2));
      
    } catch (error) {
      console.error('AI response error:', error);
      addMessage({
        text: 'Özür dilerim, şu an ne diyeceğimi bilemedim... 😅',
        sender: 'character',
        timestamp: new Date()
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!character) {
    return (
      <div className="chat-screen loading">
        <div className="loading-spinner">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="chat-screen">
      {/* Header - Liquid Glass */}
      <motion.header 
        className="chat-header glass"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <div className="character-info">
          <div className="character-avatar">
            <img 
              src={`/characters/${character.name}/avatar.jpg`} 
              alt={character.name}
              onError={(e) => e.target.src = '/placeholder-avatar.png'}
            />
            <span className="online-indicator"></span>
          </div>
          <div className="character-details">
            <h2>{character.name}</h2>
            <p className="status">
              {isTyping ? 'yazıyor...' : 'çevrimiçi'}
            </p>
          </div>
        </div>
        
        <div className="relationship-bar">
          <div className="relationship-label">💕 {relationshipLevel}%</div>
          <div className="relationship-progress">
            <motion.div 
              className="relationship-fill"
              initial={{ width: '10%' }}
              animate={{ width: `${relationshipLevel}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </motion.header>

      {/* Messages Area */}
      <div className="messages-container">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id || index}
              className={`message-wrapper ${message.sender}`}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className={`message-bubble glass ${message.sender}`}>
                <p className="message-text">{message.text}</p>
                <span className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div 
            className="typing-indicator"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="typing-bubble glass">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Keyboard Aware */}
      <motion.div 
        className="chat-input-container glass"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
      >
        <div className="input-actions left">
          <button className="action-button" aria-label="Emoji">
            <Smile size={24} />
          </button>
          <button className="action-button" aria-label="Image">
            <Image size={24} />
          </button>
        </div>

        <div className="input-wrapper">
          <textarea
            ref={inputRef}
            className="message-input glass"
            placeholder={`${character.name}'e mesaj yaz...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
            maxLength={500}
          />
        </div>

        <div className="input-actions right">
          {inputText.trim() ? (
            <motion.button
              className="send-button"
              onClick={handleSendMessage}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
            >
              <Send size={24} />
            </motion.button>
          ) : (
            <button className="action-button" aria-label="Voice">
              <Mic size={24} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ChatScreen;