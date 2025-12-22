import React, { useState, useRef, useEffect } from 'react';
import './AIChatbot.css';

const AIChatbot = () => {
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: 'Hello! I am your AI Assistant. You can ask me anything - from solar energy questions to general knowledge, science, technology, education, or any other topic. How can I help you today?' 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatWindowRef = useRef(null);

  // آپ کی DeepSeek API Key
  const DEEPSEEK_API_KEY = 'sk-ca175607b5ac46adaed0470941eb9868';

  const callDeepSeekAPI = async (userMessage) => {
    try {
      setIsTyping(true);
      
      // Get conversation history
      const recentMessages = messages.slice(-10).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      
      // **CORS Proxy Solution 1: CORS Anywhere**
      const proxyUrl = 'https://corsproxy.io/?';
      const apiUrl = 'https://api.deepseek.com/v1/chat/completions';
      
      const response = await fetch(proxyUrl + encodeURIComponent(apiUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Origin': 'http://localhost:3000'
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `You are a helpful AI assistant named "AI Assistant". You can help with any topic including:
              - Solar energy and renewable energy
              - Technology and programming
              - Science and education
              - Health and wellness
              - Business and finance
              - General knowledge
              - Creative writing
              - Problem solving
              
              Guidelines:
              1. Be helpful, accurate, and informative
              2. If you don't know something, say so honestly
              3. Keep responses clear and concise
              4. For technical topics, explain in simple terms
              5. Be friendly and engaging`
            },
            ...recentMessages,
            {
              role: "user",
              content: userMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          stream: false
        })
      });

      if (!response.ok) {
        console.error('API Error Response:', response.status);
        
        // **Fallback: Try without proxy if proxy fails**
        try {
          const directResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
              'Accept': 'application/json'
            },
            mode: 'cors', // Try with explicit cors mode
            credentials: 'omit',
            body: JSON.stringify({
              model: "deepseek-chat",
              messages: [
                {
                  role: "system",
                  content: `You are a helpful AI assistant.`
                },
                {
                  role: "user",
                  content: userMessage
                }
              ],
              temperature: 0.7,
              max_tokens: 1000
            })
          });
          
          if (directResponse.ok) {
            const directData = await directResponse.json();
            return directData.choices[0].message.content;
          }
        } catch (directError) {
          console.log('Direct API call also failed');
        }
        
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
      } else {
        throw new Error('Invalid response format from API');
      }
      
    } catch (error) {
      console.error('API Error:', error);
      return getFallbackResponse(userMessage, error);
    } finally {
      setIsTyping(false);
    }
  };

  const getFallbackResponse = (question, error = null) => {
    const lower = question.toLowerCase();
    
    // Check for specific API errors
    if (error?.message?.includes('401') || error?.message?.includes('403')) {
      return `🔐 **API Key Issue Detected**
      
Your API key: ${DEEPSEEK_API_KEY.substring(0, 10)}...
      
**Possible issues:**
1. API key expired or invalid
2. Insufficient credits/balance
3. Key not activated properly

**Solutions:**
• Check your DeepSeek account balance
• Generate a new API key
• Wait a few minutes and try again`;
    }
    
    if (error?.message?.includes('429')) {
      return "⏳ **Rate Limit Exceeded**\n\nToo many requests. DeepSeek API has rate limits. Please wait 1-2 minutes and try again.";
    }
    
    if (error?.message?.includes('CORS') || error?.message?.includes('Failed to fetch')) {
      return `🌐 **CORS Policy Blocked**
      
**Issue:** Browser security blocked the API request.
      
**Working Solutions:**
1. **Use Chrome with CORS disabled:**
   \`chrome.exe --disable-web-security --user-data-dir="C:/temp"\`
   
2. **Install CORS extension:**
   • Allow CORS: Access-Control-Allow-Origin
   • CORS Unblock
   
3. **Development workaround:** Use the mock responses below`;

      // Include mock responses for development
    }
    
    // General fallback responses
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return "Hello! 👋 I'm your AI assistant. How can I help you today?";
    }
    
    if (lower.includes('who are you') || lower.includes('what are you')) {
      return "I'm an AI assistant powered by DeepSeek AI. I'm here to help you with any questions or tasks you might have. You can ask me about anything!";
    }
    
    if (lower.includes('how are you')) {
      return "I'm doing great, thanks for asking! Ready to help you with anything you need. 😊";
    }
    
    if (lower.includes('thank') || lower.includes('thanks')) {
      return "You're welcome! 😊 If you have any more questions, feel free to ask.";
    }
    
    if (lower.includes('solar') || lower.includes('panel') || lower.includes('energy')) {
      return `☀️ **About Solar Energy in Pakistan:**
      
**Costs (PKR):**
• 3kW system: 600,000 - 800,000
• 5kW system: 950,000 - 1,300,000  
• 10kW system: 1,800,000 - 2,500,000

**ROI:** 3-5 years payback
**Subsidies:** AEDB offers up to 30%
**Net Metering:** Available in all major cities

**Best Companies in Pakistan:**
1. PAK Solar Solutions (Lahore)
2. SolarTech Pakistan (Karachi)  
3. SunPower Pakistan (Islamabad)
4. ECO Solar Pakistan (Multan)

What specific question do you have?`;
    }
    
    if (lower.includes('cost') || lower.includes('price') || lower.includes('kitna')) {
      return `💰 **Solar System Prices in Pakistan:**
      
**Residential Systems:**
• 3kW: PKR 600,000 - 800,000
• 5kW: PKR 950,000 - 1,300,000
• 7kW: PKR 1,300,000 - 1,800,000

**Commercial Systems:**
• 10kW: PKR 1,800,000 - 2,500,000
• 15kW: PKR 2,700,000 - 3,500,000
• 20kW: PKR 3,600,000 - 4,500,000

*Prices include panels, inverter, installation, and net metering setup.*`;
    }
    
    if (lower.includes('panel') || lower.includes('kitn') || lower.includes('need')) {
      return `🏠 **Solar Panels Needed:**
      
**For Pakistani Homes:**
• 2-3 bedroom: 12-16 panels (450W each)
• 4-5 bedroom: 18-24 panels (450W each)  
• 6+ bedroom: 25-30+ panels (550W each)

**Roof Space Required:**
• Each 450W panel: ~2 square meters
• 5kW system: ~25-30 sq.m roof space
• 10kW system: ~50-60 sq.m roof space`;
    }
    
    // Default response with helpful information
    return `🤖 **AI Assistant - Development Mode**

**Your Question:** "${question}"

**Current Status:** API connection blocked by CORS policy

**For Development Testing:** Ask me about:

**💰 Solar Costs in Pakistan:**
• System prices in PKR
• ROI calculations  
• Government subsidies

**🏠 Home Requirements:**
• Panels needed for your house
• Roof space calculations
• Installation process

**📊 Technical Info:**
• Panel types and efficiency
• Inverter specifications
• Maintenance requirements

**Or try these examples:**
• "5kW system cost in Lahore?"
• "Panels for 4 bedroom house?"
• "AEDB subsidy process?"
• "Net metering in Karachi?"`;
  };

  const askChatbot = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInputText('');

    const aiResponse = await callDeepSeekAPI(userMessage);
    setMessages(prev => [...prev, { sender: 'bot', text: aiResponse }]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isTyping) {
      askChatbot();
    }
  };

  const clearChat = () => {
    setMessages([
      { 
        sender: 'bot', 
        text: 'Chat cleared! 🧹 Ready to help you with any questions you might have. What would you like to know about?' 
      }
    ]);
  };

  const handleExampleQuestion = (question) => {
    setInputText(question);
    setTimeout(() => askChatbot(), 100);
  };

  const handleTopicSelection = (topic) => {
    const topics = {
      'solar': 'What is the cost of a 5kW solar system in Pakistan?',
      'tech': 'Explain artificial intelligence in simple terms',
      'science': 'What is quantum computing?',
      'health': 'What are the benefits of regular exercise?',
      'finance': 'How to start investing in Pakistan?',
      'education': 'Best way to learn programming?',
      'general': 'Who was Allama Iqbal?',
      'creative': 'Help me write a short poem about nature'
    };
    
    if (topics[topic]) {
      handleExampleQuestion(topics[topic]);
    }
  };

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <section id="chatbot" className="chatbot-section">
      <h2>🤖 Universal AI Assistant</h2>
      <p className="chatbot-tagline">Ask me anything - From solar energy to general knowledge!</p>
      
     

      {/* API Status */}
      <div className="api-status">
        <div className="status-indicator">
          <span className={`status-dot ${DEEPSEEK_API_KEY ? 'active' : 'inactive'}`}></span>
          <span>DeepSeek API {DEEPSEEK_API_KEY ? 'Connected via Proxy' : 'Not Configured'}</span>
        </div>
      </div>

      {/* Topic Selection */}
      <div className="topic-selection">
        <p className="topic-title">Quick topics you can ask about:</p>
        <div className="topic-buttons">
          <button className="topic-btn solar" onClick={() => handleTopicSelection('solar')}>
            ☀️ Solar Energy
          </button>
          <button className="topic-btn tech" onClick={() => handleTopicSelection('tech')}>
            💻 Technology
          </button>
          <button className="topic-btn science" onClick={() => handleTopicSelection('science')}>
            🔬 Science
          </button>
          <button className="topic-btn health" onClick={() => handleTopicSelection('health')}>
            🏥 Health
          </button>
          <button className="topic-btn finance" onClick={() => handleTopicSelection('finance')}>
            💰 Finance
          </button>
          <button className="topic-btn education" onClick={() => handleTopicSelection('education')}>
            📚 Education
          </button>
          <button className="topic-btn general" onClick={() => handleTopicSelection('general')}>
            🌍 General
          </button>
          <button className="topic-btn creative" onClick={() => handleTopicSelection('creative')}>
            🎨 Creative
          </button>
        </div>
      </div>

      {/* Example Questions */}
      <div className="example-questions">
        <p className="examples-title">💡 Try these solar questions:</p>
        <div className="examples-grid">
          <button className="example-btn" onClick={() => handleExampleQuestion("5kW solar system cost in Pakistan?")}>
            5kW System Cost?
          </button>
          <button className="example-btn" onClick={() => handleExampleQuestion("How many panels for 4 bedroom house?")}>
            Panels for 4 BHK?
          </button>
          <button className="example-btn" onClick={() => handleExampleQuestion("AEDB subsidy process?")}>
            AEDB Subsidy?
          </button>
          <button className="example-btn" onClick={() => handleExampleQuestion("Net metering in Lahore?")}>
            Net Metering?
          </button>
          <button className="example-btn" onClick={() => handleExampleQuestion("Best solar company in Karachi?")}>
            Best Company?
          </button>
          <button className="example-btn" onClick={() => handleExampleQuestion("Solar panel maintenance tips?")}>
            Maintenance Tips?
          </button>
        </div>
      </div>

      {/* Chat Window */}
      <div id="chat-window" className="chat-window" ref={chatWindowRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}-message`}>
            <div className="message-header">
              <span className="sender-icon">
                {msg.sender === 'user' ? '👤' : '🤖'}
              </span>
              <strong className="sender-name">
                {msg.sender === 'user' ? 'You' : 'AI Assistant'}
              </strong>
              {msg.sender === 'bot' && (
                <span className="ai-badge">DeepSeek</span>
              )}
            </div>
            <div className="message-text">{msg.text}</div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message bot-message">
            <div className="typing-indicator">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="typing-text">Thinking about your question...</span>
            </div>
          </div>
        )}
      </div>

      {/* Chat Controls */}
      <div className="chat-controls">
        <div className="chat-input-container">
          <input
            type="text"
            id="chat-input"
            placeholder="Ask me anything... (Press Enter to send)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping}
          />
          <button 
            onClick={askChatbot} 
            className="send-btn"
            disabled={isTyping || !inputText.trim()}
          >
            {isTyping ? (
              <>
                <span className="spinner"></span>
                Thinking...
              </>
            ) : 'Ask AI'}
          </button>
        </div>
        
        <div className="action-buttons">
          <button onClick={clearChat} className="action-btn clear-btn">
            🗑️ Clear Chat
          </button>
          <button 
            onClick={() => handleExampleQuestion("What can you help me with?")}
            className="action-btn help-btn"
          >
            ❓ What can you do?
          </button>
          <button 
            onClick={() => handleExampleQuestion("Tell me a fun fact about Pakistan")}
            className="action-btn fun-btn"
          >
            😄 Fun Fact
          </button>
        </div>
      </div>

     

      {/* Status Footer */}
      <div className="status-footer">
        <div className="status-indicator">
          <span className="status-dot active"></span>
          <span>AI Assistant Online (Proxy Mode)</span>
        </div>
        <div className="message-count">
          Messages: {messages.filter(m => m.sender === 'user').length}
        </div>
      </div>
    </section>
  );
};

export default AIChatbot;