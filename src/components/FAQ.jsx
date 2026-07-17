import React, { useState } from 'react';
import './FAQ.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const items = [
    {
      question: 'How do I know how many solar panels I need?',
      answer:
        'Start with your total connected load (watts) and daily usage (hours). This app’s calculator estimates recommended panel count with a buffer for losses.',
    },
    {
      question: 'What panel wattage should I choose in Pakistan?',
      answer:
        'Higher-watt panels reduce the number of panels needed, but availability and pricing vary. Compare 400W–600W options and consider roof space, budget, and brand warranty.',
    },
    {
      question: 'Do I need batteries for my solar system?',
      answer:
        'Not always. On-grid systems with net metering can work without batteries. Batteries add backup during load-shedding but increase cost and require maintenance.',
    },
    {
      question: 'What inverter size is recommended?',
      answer:
        'A common approach is sizing the inverter about 20–30% above your peak load to handle surges. The calculator provides an estimate based on your appliances.',
    },
    {
      question: 'How does net metering work in Pakistan?',
      answer:
        'Net metering lets you export excess solar to the grid and receive credits against your bill. Requirements depend on your DISCO and system design, so confirm current rules and paperwork.',
    },
    {
      question: 'How long does it take to recover the cost (ROI)?',
      answer:
        'ROI depends on your consumption, unit rate, system cost, and how much energy you export. Use the calculator results and current panel pricing to estimate payback in months.',
    },
  ];

  const toggle = (index) => {
    setOpenIndex((current) => (current === index ? -1 : index));
  };

  return (
    <section id="faq" className="faq-section glass-panel">
      <h2>Frequently Asked Questions</h2>
      <p className="section-subtitle">Common questions about sizing, costs, and setup.</p>

      <div className="faq-list">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          const buttonId = `faq-button-${index}`;
          const panelId = `faq-panel-${index}`;

          return (
            <div key={item.question} className={`faq-item ${isOpen ? 'is-open' : ''}`}>
              <button
                type="button"
                id={buttonId}
                className="faq-question"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
              >
                <span className="faq-question__text">{item.question}</span>
                <span className="faq-question__icon" aria-hidden="true">
                  {isOpen ? '−' : '+'}
                </span>
              </button>

              <div
                id={panelId}
                className="faq-answer"
                role="region"
                aria-labelledby={buttonId}
                hidden={!isOpen}
              >
                <p>{item.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FAQ;

