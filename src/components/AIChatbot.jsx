import React, { useState, useRef, useEffect } from 'react';
import './AIChatbot.css';

const AIChatbot = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am your Solar AI Assistant. You can ask me anything about solar panel sizing, inverter selection, net metering in Pakistan, or system ROI calculations.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatWindowRef = useRef(null);

  // DeepSeek API Configuration (read from environment variable, never hardcoded in git)
  const DEEPSEEK_API_KEY = process.env.REACT_APP_DEEPSEEK_API_KEY || "";
  const PROXY_URL = "https://api.allorigins.win/raw?url=";
  const API_ENDPOINT = "https://api.deepseek.com/v1/chat/completions";

  // System Prompt
  const SYSTEM_PROMPT = `You are an expert AI solar consultant for Pakistan. Provide concise, helpful, and technically accurate advice on solar sizing, net metering, DISCO regulations (LESCO, K-Electric, IESCO, etc.), inverter pairing, and Pakistani solar pricing in PKR. Keep responses structured and easy to read.`;

  const askChatbot = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage = inputText.trim();
    setInputText('');
    
    // Add user message
    const newMessages = [
      ...messages,
      {
        sender: 'user',
        text: userMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const response = await callDeepSeekAPI(userMessage, newMessages);
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: getFallbackResponse(userMessage),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const callDeepSeekAPI = async (userMessage, chatHistory) => {
    try {
      const conversation = [
        { role: "system", content: SYSTEM_PROMPT },
        ...chatHistory.slice(-6).map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: "user", content: userMessage }
      ];

      const directResponse = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: conversation,
          temperature: 0.6,
          max_tokens: 800
        })
      });

      if (directResponse.ok) {
        const directData = await directResponse.json();
        return directData.choices[0].message.content;
      }
      
      throw new Error(`API error: ${directResponse.status}`);
    } catch (err) {
      return getFallbackResponse(userMessage);
    }
  };

  const getFallbackResponse = (question) => {
    const q = question.toLowerCase();
    if (q.includes('cost') || q.includes('price') || q.includes('5kw') || q.includes('10kw')) {
      return "In Pakistan, a turnkey on-grid solar system costs approximately PKR 120,000 to 140,000 per kW. A standard 5 kW system averages PKR 600,000–700,000 including tier-1 panels, a hybrid/on-grid inverter, mounting structure, and net metering documentation.";
    }
    if (q.includes('ac') || q.includes('air conditioner') || q.includes('1.5 ton')) {
      return "A 1.5-ton inverter AC typically consumes 1,200W to 1,800W while cooling. You will need about 4 to 5 Tier-1 panels (550W each) and a minimum 3.2kW to 5kW inverter to run it comfortably alongside your essential household load.";
    }
    if (q.includes('net metering') || q.includes('lesco') || q.includes('kelectric') || q.includes('iesco')) {
      return "Net metering in Pakistan allows you to export excess daytime solar energy back to your distribution company (DISCO) at NEPRA-approved rates. Requirements include an AEDB-certified installer, 3-phase green meter, and an on-grid/hybrid three-phase inverter.";
    }
    if (q.includes('battery') || q.includes('backup') || q.includes('lithium')) {
      return "For night backup during load-shedding, Lithium Iron Phosphate (LiFePO4) batteries are recommended over tubular batteries due to higher cycle life (3,000+ cycles) and 90% depth of discharge, despite higher upfront cost.";
    }
    return `Regarding your inquiry: For optimal reliability, consider Tier-1 monocrystalline panels (550W–600W) with an inverter sized 20% higher than your peak connected load. You can test your specific requirements using the Sizing Engine above.`;
  };

  const handleExample = (text) => {
    setInputText(text);
  };

  const clearChat = () => {
    setMessages([
      {
        sender: 'bot',
        text: "Conversation refreshed. How may I assist with your solar setup?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <section id="chatbot" className="chatbot-section glass-panel">
      {/* Section Header */}
      <div className="section-header">
        <span className="section-pill">Intelligence Engine</span>
        <h2>Solar AI Assistant</h2>
        <p className="section-subtitle">
          Real-time technical guidance for sizing, grid regulations, and system economics.
        </p>
      </div>

      {/* Quick Prompts */}
      <div className="chatbot-topics">
        <span className="topics-label">Suggested queries:</span>
        <div className="topics-row">
          <button 
            type="button" 
            className="topic-pill"
            onClick={() => handleExample("What is the cost of a 5kW on-grid system in Pakistan?")}
          >
            5kW system cost
          </button>
          <button 
            type="button" 
            className="topic-pill"
            onClick={() => handleExample("How many 550W panels needed for 1.5 ton AC?")}
          >
            Panels for 1.5 ton AC
          </button>
          <button 
            type="button" 
            className="topic-pill"
            onClick={() => handleExample("What is the net metering process and paperwork?")}
          >
            Net metering process
          </button>
          <button 
            type="button" 
            className="topic-pill"
            onClick={() => handleExample("Lithium battery vs Tubular battery comparison")}
          >
            Lithium vs Tubular
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="chat-container">
        <div className="chat-window" ref={chatWindowRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`chat-bubble ${msg.sender}-bubble`}>
              <div className="bubble-meta">
                <span className="bubble-author">{msg.sender === 'user' ? 'You' : 'Solar AI'}</span>
                <span className="bubble-time">{msg.timestamp}</span>
              </div>
              <div className="bubble-text">{msg.text}</div>
            </div>
          ))}

          {isTyping && (
            <div className="chat-bubble bot-bubble is-loading">
              <div className="typing-dots">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="chat-input-bar">
          <input
            type="text"
            className="chat-field"
            placeholder="Ask about panels, inverters, net metering, or subsidies..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') askChatbot();
            }}
            disabled={isTyping}
          />
          <button 
            type="button" 
            className="chat-send-btn"
            onClick={askChatbot}
            disabled={isTyping || !inputText.trim()}
          >
            Send →
          </button>
        </div>

        <div className="chat-footer-controls">
          <span className="status-live">
            <span className="status-dot-pulse" />
            AI Online
          </span>
          <button type="button" className="clear-link" onClick={clearChat}>
            Clear conversation
          </button>
        </div>
      </div>
    </section>
  );
};

export default AIChatbot;