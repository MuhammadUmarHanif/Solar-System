import React, { useState } from 'react';
import './QuoteModal.css';
import { useSupplier } from '../context/SupplierContext';
import dbService from '../services/db';
import { IconX, IconZap, IconCheckCircle, IconWhatsApp } from './Icons';

export default function QuoteModal({ isOpen, onClose, quoteData }) {
  const { activeSupplier, submitCustomerBooking } = useSupplier() || {};

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsappNumber: '',
    address: '',
    roofType: 'Concrete Flat Roof',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [generatedWaUrl, setGeneratedWaUrl] = useState('');

  if (!isOpen || !quoteData) return null;

  const { 
    vendor, 
    supplier: propSupplier, 
    systemKw, 
    numberOfPanels,
    panel, 
    inverter,
    battery,
    totalCost, 
    city 
  } = quoteData;

  const supplier = propSupplier || vendor || activeSupplier || {
    name: 'Orbit Certified Solar Partner',
    whatsapp: '923008452190',
    cityName: city?.name || 'Pakistan'
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    const cityCode = (city?.id || city?.name || 'PAK').substring(0, 3).toUpperCase();
    const ref = `PAK-${cityCode}-${Math.floor(1000 + Math.random() * 9000)}`;
    setReferenceId(ref);

    const waNum = formData.whatsappNumber.trim() || formData.phone.trim();

    // Lead payload for SaaS DB
    const leadPayload = {
      ref,
      supplierId: supplier.id || activeSupplier?.id || 'sup_apex_solar',
      customerName: formData.name.trim(),
      phone: formData.phone.trim(),
      whatsappNumber: waNum,
      city: typeof city === 'string' ? city : (city?.name || 'Pakistan'),
      address: formData.address.trim(),
      roofType: formData.roofType,
      systemKw: parseFloat(systemKw) || 5.0,
      numberOfPanels: numberOfPanels || 10,
      selectedPanel: panel ? {
        id: panel.id,
        name: panel.name || `${panel.brand} ${panel.wattage || panel.watts}W`,
        wattage: panel.wattage || panel.watts || 585,
        price: panel.price || 0
      } : null,
      selectedInverter: inverter ? {
        id: inverter.id,
        name: inverter.name,
        wattage: inverter.wattage || (systemKw * 1000),
        price: inverter.price || 0
      } : null,
      selectedBattery: battery ? {
        id: battery.id,
        name: battery.name,
        capacityKwh: battery.capacityKwh || 5,
        price: battery.price || 0
      } : null,
      estimatedTotalCost: totalCost || 0,
      notes: formData.notes.trim()
    };

    // Save to Multi-tenant Database
    try {
      if (submitCustomerBooking) {
        submitCustomerBooking(leadPayload);
      } else {
        dbService.createLead(leadPayload);
      }
    } catch {
      dbService.createLead(leadPayload);
    }

    // Build Professional Pre-filled WhatsApp message
    const waText = 
      `Hello ${supplier.name},\n` +
      `I am interested in the solar system calculated through your website (Ref: ${ref}).\n\n` +
      `⚡ System Size: ${systemKw} kW\n` +
      `☀️ Panels: ${numberOfPanels || '10'} × ${panel?.name || 'Tier-1 Module'}\n` +
      (inverter?.name ? `🔌 Inverter: ${inverter.name}\n` : '') +
      (battery?.name ? `🔋 Battery: ${battery.name}\n` : '') +
      `💰 Estimated Cost: PKR ${(totalCost / 100000).toFixed(2)} Lakh (Rs. ${Number(totalCost).toLocaleString()})\n` +
      `👤 Name: ${formData.name.trim()}\n` +
      `📞 Phone: ${formData.phone.trim()}\n` +
      `📍 City: ${typeof city === 'string' ? city : (city?.name || 'Pakistan')}\n` +
      (formData.address ? `🏠 Address: ${formData.address.trim()}\n` : '') +
      (formData.notes ? `📝 Notes: ${formData.notes.trim()}\n\n` : '\n') +
      `I would like to confirm the final price and schedule a roof site survey.`;

    const cleanWaNumber = (supplier.whatsapp || '923008452190').replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(waText)}`;
    setGeneratedWaUrl(waUrl);

    setSubmitted(true);
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setFormData({ name: '', phone: '', whatsappNumber: '', address: '', roofType: 'Concrete Flat Roof', notes: '' });
    onClose();
  };

  return (
    <div className="quote-modal-overlay" onClick={handleResetAndClose}>
      <div className="quote-modal-content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="quote-modal-close" onClick={handleResetAndClose} aria-label="Close">
          <IconX size={16} />
        </button>

        {!submitted ? (
          <>
            <div className="quote-modal-header">
              <span className="quote-pill">
                <IconZap size={13} />
                <span>Free Official Site Survey & Turnkey Proposal</span>
              </span>
              <h3>Book / Request This System with {supplier?.name}</h3>
              <p className="quote-header-sub">
                Lock in verified equipment & labor rates for your <strong>{systemKw} kW</strong> system in <strong>{supplier?.cityName || city?.name}</strong>.
              </p>
            </div>

            {/* Quick Summary Pill */}
            <div className="quote-summary-strip">
              <div className="summary-item">
                <span className="item-label">System Size:</span>
                <span className="item-val num-tabular">{systemKw} kW</span>
              </div>
              <div className="summary-item">
                <span className="item-label">Modules:</span>
                <span className="item-val num-tabular">{numberOfPanels || '10'} × {panel?.wattage || panel?.watts || 585}W</span>
              </div>
              <div className="summary-item">
                <span className="item-label">Est. Turnkey:</span>
                <span className="item-val highlight-green num-tabular">PKR {(totalCost / 100000).toFixed(2)} Lakh</span>
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

              <div className="quote-input-row">
                <div className="quote-input-group">
                  <label htmlFor="q-phone">Contact Phone Number *</label>
                  <input
                    id="q-phone"
                    type="tel"
                    required
                    placeholder="e.g. 0300 1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="quote-input-group">
                  <label htmlFor="q-whatsapp">WhatsApp Number (Optional)</label>
                  <input
                    id="q-whatsapp"
                    type="tel"
                    placeholder="e.g. 0300 1234567 (if different)"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  />
                </div>
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
                  <label htmlFor="q-roof">Roof Structure Type</label>
                  <select
                    id="q-roof"
                    value={formData.roofType}
                    onChange={(e) => setFormData({ ...formData, roofType: e.target.value })}
                  >
                    <option value="Concrete Flat Roof">Concrete Flat Roof (Standard L2/L3)</option>
                    <option value="Elevated Walkable Structure">Elevated Walkable Steel Structure</option>
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
                  placeholder="e.g. Inverter brand preference, net metering timeline..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="quote-actions">
                <button type="submit" className="btn-submit-quote">
                  Confirm Booking & Request Official Survey
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="quote-success-view">
            <div className="success-icon-wrap">
              <IconCheckCircle size={32} />
            </div>
            <h3>System Booking Confirmed!</h3>
            <p className="success-msg">
              Your solar inquiry has been saved and assigned to <strong>{supplier?.name}</strong>.
            </p>

            <div className="ref-badge-card">
              <span className="ref-label">Official Tracking Reference:</span>
              <span className="ref-code num-tabular">{referenceId}</span>
              <p className="ref-sub">
                A certified solar engineer from {supplier?.name} has received your specification and will contact you at <strong>{formData.phone}</strong>.
              </p>
            </div>

            <div className="success-actions">
              <a
                href={generatedWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-direct"
              >
                <IconWhatsApp size={18} />
                <span>Contact {supplier?.name} on WhatsApp Now</span>
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
