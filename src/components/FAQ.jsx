import React, { useState } from 'react';
import './FAQ.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const items = [
    {
      question: 'How do I determine the number of solar panels needed?',
      answer:
        'Start by calculating your total connected appliance wattage and daily running hours. Our Sizing Engine calculates your total daily kWh consumption and divides it by regional peak sun hours, automatically adding a 20% safety buffer for weather and conversion losses.',
    },
    {
      question: 'What module wattage is recommended for residential roofs in Pakistan?',
      answer:
        'Modern Tier-1 550W to 600W Monocrystalline or Bifacial modules are currently the standard benchmark in Pakistan. They maximize energy density per square meter, requiring fewer roof brackets and cabling while delivering superior low-light performance.',
    },
    {
      question: 'Do on-grid solar systems require battery backup?',
      answer:
        'No. Standard on-grid systems with net metering feed directly into your home and export surplus power to the DISCO grid without batteries. If you experience frequent load-shedding during night hours, a hybrid inverter paired with Lithium (LiFePO4) storage is recommended.',
    },
    {
      question: 'How does Net Metering work with local DISCOs (LESCO, KE, IESCO)?',
      answer:
        'Net metering utilizes a bidirectional 3-phase green meter. When your solar generates more electricity than your premises consume, units are exported to the national grid. These units are credited against your nighttime or off-peak consumption on your monthly bill.',
    },
    {
      question: 'What is the average payback period (ROI) for a home system?',
      answer:
        'Given current grid electricity unit tariffs in Pakistan, a typical 5kW to 10kW residential solar system achieves complete payback within 2.5 to 3.5 years, followed by 20+ years of essentially free daytime power.',
    },
    {
      question: 'What inverter sizing should I pair with my panel array?',
      answer:
        'As a rule of thumb, select an inverter capacity rated 20% to 25% higher than your simultaneous peak running wattage to comfortably absorb initial appliance surge currents (like compressor startup).',
    },
  ];

  const toggle = (index) => {
    setOpenIndex((current) => (current === index ? -1 : index));
  };

  return (
    <section id="faq" className="faq-section glass-panel">
      {/* Section Header */}
      <div className="section-header">
        <span className="section-pill">Support & Knowledge</span>
        <h2>Frequently Asked Questions</h2>
        <p className="section-subtitle">
          Essential answers regarding system sizing, inverter compatibility, and net metering.
        </p>
      </div>

      <div className="faq-list">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          const buttonId = `faq-btn-${index}`;
          const panelId = `faq-panel-${index}`;

          return (
            <div key={item.question} className={`faq-card ${isOpen ? 'is-open' : ''}`}>
              <button
                type="button"
                id={buttonId}
                className="faq-trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
              >
                <span className="faq-q-text">{item.question}</span>
                <span className="faq-icon" aria-hidden="true">
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="chevron-svg"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </button>

              <div
                id={panelId}
                className="faq-content"
                role="region"
                aria-labelledby={buttonId}
                hidden={!isOpen}
              >
                <p className="faq-a-text">{item.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FAQ;
