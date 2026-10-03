import React, { useState } from 'react';
import './QuoteModal.css';

export default function QuoteModal({ isOpen, onClose, quoteData }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    roofType: 'Concrete Flat Roof',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState('');

  if (!isOpen || !quoteData) return null;

  const { vendor, systemKw, panel, totalCost, city } = quoteData;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    const ref = `PAK-${city?.id?.toUpperCase() || 'SOLAR'}-${Math.floor(1000 + Math.random() * 9000)}`;
    setReferenceId(ref);

    // Save lead locally
    const lead = {
      ref,
      ...formData,
      vendor: vendor?.name,
      systemKw,
      panel: panel?.name,
      totalCost,
      city: city?.name,
      timestamp: new Date().toISOString()
    };

    try {
      const existing = JSON.parse(localStorage.getItem('solar_quote_requests') || '[]');
      existing.unshift(lead);
      localStorage.setItem('solar_quote_requests', JSON.stringify(existing));
    } catch {
      // fallback
    }

    setSubmitted(true);
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setFormData({ name: '', phone: '', address: '', roofType: 'Concrete Flat Roof', notes: '' });
    onClose();
  };

  return (
    <div className="quote-modal-overlay" onClick={handleResetAndClose}>
      <div className="quote-modal-content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="quote-modal-close" onClick={handleResetAndClose} aria-label="Close">
          ✕
        </button>

        {!submitted ? (
          <>
            <div className="quote-modal-header">
              <span className="quote-pill">⚡ Free Official Site Survey</span>
              <h3>Request Turnkey Quote from {vendor?.name}</h3>
              <p className="quote-header-sub">
                Lock in verified rates for your <strong>{systemKw} kW</strong> system in <strong>{vendor?.area}, {city?.name}</strong>.
              </p>
            </div>

            {/* Quick Summary Pill */}
            <div className="quote-summary-strip">
              <div className="summary-item">
                <span className="item-label">System Size:</span>
                <span className="item-val">{systemKw} kW</span>
              </div>
              <div className="summary-item">
                <span className="item-label">Panel:</span>
                <span className="item-val">{panel?.brand} {panel?.watts}W</span>
              </div>
              <div className="summary-item">
                <span className="item-label">Est. Turnkey:</span>
                <span className="item-val highlight-green">PKR {(totalCost / 100000).toFixed(2)} Lakh</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="quote-form">
              <div className="quote-input-group">
                <label htmlFor="q-name">Your Full Name *</label>
                <input
                  id="q-name"
                  type="text"
                  required
                  placeholder="e.g. Muhammad Ali"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="quote-input-group">
                <label htmlFor="q-phone">WhatsApp / Mobile Number *</label>
                <input
                  id="q-phone"
                  type="tel"
                  required
                  placeholder="e.g. 0300 1234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <span className="input-hint">The vendor will send the itemized bill of materials on WhatsApp.</span>
              </div>

              <div className="quote-input-row">
                <div className="quote-input-group">
                  <label htmlFor="q-address">House / Roof Address</label>
                  <input
                    id="q-address"
                    type="text"
                    placeholder="e.g. House 42, Block B, DHA"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="quote-input-group">
                  <label htmlFor="q-roof">Roof Type</label>
                  <select
                    id="q-roof"
                    value={formData.roofType}
                    onChange={(e) => setFormData({ ...formData, roofType: e.target.value })}
                  >
                    <option value="Concrete Flat Roof">Concrete Flat Roof</option>
                    <option value="Elevated Walkable Structure">Elevated Walkable Structure</option>
                    <option value="Tin / Corrugated Shed">Tin / Corrugated Shed</option>
                    <option value="Open Ground / Lawn">Open Ground / Lawn</option>
                  </select>
                </div>
              </div>

              <div className="quote-input-group">
                <label htmlFor="q-notes">Special Requirements / Notes (Optional)</label>
                <textarea
                  id="q-notes"
                  rows="2"
                  placeholder="e.g. Need net metering expedited before summer..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="quote-actions">
                <button type="submit" className="btn-submit-quote">
                  Confirm Free Quote & Site Survey Request
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="quote-success-view">
            <div className="success-icon-wrap">✓</div>
            <h3>Quote Request Confirmed!</h3>
            <p className="success-msg">
              Your inquiry has been submitted to <strong>{vendor?.name}</strong>.
            </p>

            <div className="ref-badge-card">
              <span className="ref-label">Official Tracking Reference:</span>
              <span className="ref-code">{referenceId}</span>
              <p className="ref-sub">An engineer from {vendor?.name} will contact you at <strong>{formData.phone}</strong> within 2 hours to confirm your roof survey.</p>
            </div>

            <div className="success-actions">
              <a
                href={`https://wa.me/${vendor?.whatsapp}?text=${encodeURIComponent(`Assalam o Alaikum! I just booked a site survey on Orbit Solar. Ref ID: ${referenceId} for ${systemKw} kW in ${city?.name}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-direct"
              >
                Chat Directly on WhatsApp Now
              </a>

              <button type="button" className="btn-done" onClick={handleResetAndClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
