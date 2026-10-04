import React, { useState, useRef, useEffect } from 'react';
import './AIChatbot.css';

// System prompt tailored for Pakistani Solar Ecosystem
const SOLAR_PAK_SYSTEM_PROMPT = `You are "Orbit AI", the elite solar energy consultant for Pakistan.
Your mission is to provide accurate, transparent, and technically sound advice for Pakistani homeowners, commercial businesses, and industries.

Key Knowledge Base:
- Pakistani DISCOs: LESCO (Lahore), K-Electric (Karachi), IESCO (Islamabad/Rawalpindi), FESCO (Faisalabad), MEPCO (Multan), GEPCO (Gujranwala), PESCO (Peshawar).
- Current NEPRA tariffs: Average residential unit cost is Rs. 55 - 75 / kWh (peak/off-peak).
- Solar Panel wholesale benchmarks: Rs. 33 - 37 / Watt (Tier-1 N-Type TOPCon & Bifacial: Jinko Tiger Neo, Longi Hi-MO X6, Canadian Solar, JA Solar, Trina Solar).
- Turnkey system cost: Rs. 115,000 - 130,000 / kW for on-grid with net metering (including GI mounting frames, pure copper DC/AC cables, breakers, green meter, LESCO/DISCO processing).
- Inverters: Tier-1 pure sine wave (Sungrow, Huawei, Solis, Growatt, Inverex Nitrox, Knox). On-grid requires 3-phase connection for net metering above 3kW.
- Batteries: LiFePO4 Lithium (15-year life, 90% DoD, 48V/100Ah-200Ah) vs Tubular Lead-Acid (Phoenix/Osaka, 2-3 year life).
- Sizing rule of thumb: 1 kW of solar produces ~110-130 units/month in Pakistan (4.5 to 5.2 sun peak hours). A 1.5-Ton Inverter AC needs ~4-5 solar plates (2.5 kW generation) to run simultaneously with house base load.

Communication Style:
- Professional, welcoming, and concise.
- Seamlessly answer in English, Urdu (اردو), or Roman Urdu depending on the user's input language.
- Use clear bullet points and bold PKR pricing where appropriate. Keep answers practical and easy to understand.`;

export default function AIChatbot() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "As-salamu alaykum! ☀️ I am your **Orbit AI Assistant**, Ask me anything about solar sizing, WAPDA/K-Electric net metering, Tier-1 panel rates, or how many panels you need for your AC and appliances.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const chatWindowRef = useRef(null);

  const GEMINI_API_KEY = (process.env.REACT_APP_GEMINI_API_KEY || '').trim();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Call Google Gemini API with fallback models and localized backup
  const callGeminiAPI = async (userPrompt, currentHistory) => {
    if (!GEMINI_API_KEY) {
      return getSmartFallbackResponse(userPrompt);
    }

    // Try models in order: gemini-3.5-flash -> gemini-3.5-flash-lite -> gemini-flash-latest
    const candidateModels = [
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-flash-latest'
    ];

    // Build conversation context
    const conversationHistory = currentHistory.slice(-6).map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: SOLAR_PAK_SYSTEM_PROMPT }]
            },
            contents: [
              ...conversationHistory,
              { role: 'user', parts: [{ text: userPrompt }] }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 900
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text;
          }
        }
      } catch (err) {
        console.warn(`Gemini model ${model} failed, trying next...`, err);
      }
    }

    // Fallback if all API attempts fail
    return getSmartFallbackResponse(userPrompt);
  };

  // Localized Pakistani solar intelligence fallback
  const getSmartFallbackResponse = (question) => {
    const q = question.toLowerCase();

    if (q.includes('5kw') || (q.includes('5 kw') && q.includes('cost')) || q.includes('5 kilowatt')) {
      return `### ⚡ 5 kW Solar System Estimate (Pakistan)\n- **Turnkey Cost:** **PKR 600,000 – 680,000** (On-Grid with Net Metering)\n- **Solar Panels:** 9–10 Plates (585W Tier-1 N-Type TOPCon Jinko / Longi)\n- **Inverter:** 5kW – 6kW Dual-MPPT Inverter (Inverex Nitrox / Solis / Knox)\n- **Monthly Output:** ~**600 – 650 Units (kWh)**\n- **Monthly Bill Savings:** ~**PKR 35,000 – 42,000**\n- **Can Run:** 1x 1.5-Ton Inverter AC + Refrigerator + Water Pump (daytime) + all fans & LEDs.\n- **Payback Period:** ~2.5 – 3 Years.`;
    }

    if (q.includes('10kw') || (q.includes('10 kw') && q.includes('cost')) || q.includes('10 kilowatt')) {
      return `### ⚡ 10 kW Solar System Estimate (Pakistan)\n- **Turnkey Cost:** **PKR 1,180,000 – 1,280,000** (Turnkey 3-Phase On-Grid)\n- **Solar Panels:** 17–18 Plates (585W Jinko Tiger Neo / Longi)\n- **Inverter:** 10kW Three-Phase (Sungrow / Huawei / Solis Dual MPPT)\n- **Monthly Output:** ~**1,250 – 1,350 Units (kWh)**\n- **Monthly Bill Savings:** ~**PKR 70,000 – 85,000**\n- **Can Run:** 2x 1.5-Ton Inverter ACs simultaneously + 1.5HP Water Pump + 2x Fridges + Full House Load.\n- **Payback:** ~2.5 Years with NEPRA Green Meter export!`;
    }

    if (q.includes('ac') || q.includes('air conditioner') || q.includes('1.5 ton')) {
      return `### ❄️ Running a 1.5-Ton Inverter AC on Solar\n- **Power Consumption:** A 1.5-ton DC inverter AC consumes **1,200W – 1,600W** at startup and stabilizes at **700W – 1,000W**.\n- **Plates Needed:** **4 to 5 Solar Plates** (585W TOPCon) dedicated for the AC.\n- **Recommended Inverter:** Minimum **3.6 kW to 5 kW** system to comfortably power the AC along with your home's base load (refrigerator, fans, lights).`;
    }

    if (q.includes('net metering') || q.includes('green meter') || q.includes('lesco') || q.includes('kelectric') || q.includes('iesco')) {
      return `### 📋 NEPRA Net Metering Process in Pakistan\n1. **Prerequisite:** 3-Phase WAPDA / K-Electric sanctioned load connection.\n2. **Engineering File:** Prepared by an AEDB / PEC licensed solar installer.\n3. **Inspection & NOC:** DISCO sub-divisional officer verifies inverter certification and earthing bore resistance (< 5 Ohms).\n4. **Green Meter:** Bi-directional meter installed to count export & import units.\n5. **Billing:** Exported solar units are credited against your nighttime WAPDA usage. Processing takes **30–45 days**.`;
    }

    if (q.includes('battery') || q.includes('lithium') || q.includes('tubular') || q.includes('backup')) {
      return `### 🔋 Lithium (LiFePO4) vs Tubular Battery in Pakistan\n- **LiFePO4 Lithium (Recommended):**\n  - Lifespan: **10 to 15 Years** (3,000–6,000 cycles)\n  - Depth of Discharge: **90%**\n  - Maintenance: Zero (wall-mount rack)\n  - Cost: PKR 240,000 – 380,000 per 48V pack.\n- **Tubular Lead-Acid:**\n  - Lifespan: **2 to 3 Years**\n  - Depth of Discharge: **50%**\n  - Maintenance: Acid water topping required regularly\n  - Cost: PKR 75,000 – 120,000 per pair.`;
    }

    return `### ☀️ Solar Guidance\nFor your query about **"${question}"**:\n- In Pakistan, standard wholesale rates currently average **Rs. 34 – 37 / Watt** for Tier-1 N-Type TOPCon panels (585W).\n- We strongly recommend choosing **PEC-registered EPC installers** with genuine barcode warranties.\n- Feel free to use the **Solar Sizing Engine** above for an exact turnkey quotation and live installer rate list for your city!`;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isTyping) return;

    const userText = inputText.trim();
    setInputText('');

    const newMsgs = [
      ...messages,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    setMessages(newMsgs);
    setIsTyping(true);

    try {
      const botResponse = await callGeminiAPI(userText, newMsgs);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: botResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: getSmartFallbackResponse(userText),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTopicClick = (query) => {
    setInputText(query);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'bot',
        text: "Conversation cleared. How can I assist you with your solar setup today? Ask in English, Urdu, or Roman Urdu!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Basic markdown formatter for cleaner bot bubbles
  const renderFormattedText = (rawText) => {
    return rawText.split('\n').map((line, idx) => {
      // Heading
      if (line.startsWith('### ')) {
        return <h5 key={idx} className="bot-heading">{line.replace('### ', '')}</h5>;
      }
      // Bullet list
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const content = line.substring(2);
        return (
          <li key={idx} className="bot-list-item">
            {formatBold(content)}
          </li>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="bot-line-break" />;
      }
      return <p key={idx} className="bot-para">{formatBold(line)}</p>;
    });
  };

  const formatBold = (str) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <section id="chatbot" className="chatbot-section glass-panel">
      {/* Header */}
      <div className="chatbot-header-wrap">
        <div className="chatbot-header-info">
          <div className="chatbot-badge-row">
            
            <span className="lang-support-pill">🌐 English • Roman Urdu • اردو</span>
          </div>
          <h2 className="chatbot-title">Orbit AI Advisor</h2>
          <p className="chatbot-subtitle">
            Instant technical guidance for Pakistani solar sizing, DISCO net metering, hardware selection, and ROI economics.
          </p>
        </div>
      </div>

      {/* Suggested Query Chips */}
      <div className="suggested-queries-bar">
        <span className="queries-label">Frequently Asked:</span>
        <div className="queries-chips-wrap">
          <button
            type="button"
            className="query-chip"
            onClick={() => handleTopicClick("5kW on-grid system cost in Pakistan with net metering?")}
          >
            ⚡ 5kW System Cost
          </button>
          <button
            type="button"
            className="query-chip"
            onClick={() => handleTopicClick("How many 585W plates needed to run a 1.5-ton AC?")}
          >
            ❄️ Panels for 1.5-Ton AC
          </button>
          <button
            type="button"
            className="query-chip"
            onClick={() => handleTopicClick("What is the LESCO / K-Electric green meter net metering procedure?")}
          >
            📋 Net Metering Rules
          </button>
          <button
            type="button"
            className="query-chip"
            onClick={() => handleTopicClick("LiFePO4 Lithium battery vs Phoenix Tubular battery comparison")}
          >
            🔋 Lithium vs Tubular
          </button>
          <button
            type="button"
            className="query-chip"
            onClick={() => handleTopicClick("10kW solar system price in Lahore with Sungrow inverter")}
          >
            🏰 10kW Turnkey Package
          </button>
        </div>
      </div>

      {/* Chat Window */}
      <div className="chatbot-window-card">
        <div className="chat-messages-container" ref={chatWindowRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-row ${msg.sender === 'user' ? 'user-row' : 'bot-row'}`}>
              <div className="bubble-wrapper">
                <div className="bubble-header">
                  <span className="bubble-author">
                    {msg.sender === 'user' ? 'You' : '☀️ Orbit AI'}
                  </span>
                  <span className="bubble-time">{msg.timestamp}</span>
                </div>

                <div className="bubble-content">
                  {msg.sender === 'bot' ? renderFormattedText(msg.text) : msg.text}
                </div>

                {msg.sender === 'bot' && (
                  <div className="bubble-actions">
                    <button
                      type="button"
                      className="copy-bubble-btn"
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      title="Copy response"
                    >
                      {copiedId === msg.id ? '✓ Copied' : '📋 Copy'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="chat-row bot-row">
              <div className="bubble-wrapper typing-wrapper">
                <div className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="typing-txt">Orbit AI is analyzing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Controls */}
        <div className="chat-input-controls">
          <div className="input-field-wrap">
            <input
              type="text"
              className="chat-text-input"
              placeholder="Ask Orbit AI anything (5kW, AC plates, green meter)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              disabled={isTyping}
            />
            <button
              type="button"
              className="chat-submit-btn"
              onClick={handleSendMessage}
              disabled={isTyping || !inputText.trim()}
              aria-label="Send message"
            >
              <span>Send</span>
              <span className="send-arrow">→</span>
            </button>
          </div>

          <div className="chat-bottom-info-bar">
            <span className="disclaimer-txt">
              💡 Advice based on official NEPRA regulations & verified Pakistani market benchmarks.
            </span>
            <button type="button" className="btn-clear-chat" onClick={handleClearChat}>
              Clear chat
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}