import React, { useState, useMemo } from 'react';
import { AREA_VENDORS } from '../data/solarData';
import './AreaVendorRateList.css';

export default function AreaVendorRateList({
  selectedCity,
  selectedArea,
  onSelectArea,
  selectedPanel,
  exactSystemKw,
  numberOfPanels,
  selectedSystemType,
  calculatedResults,
  onOpenQuoteModal
}) {
  const [filterArea, setFilterArea] = useState('All Areas');
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended', 'price_low', 'rating', 'fastest'
  const [copiedVendorId, setCopiedVendorId] = useState(null);

  // Sync sub-area if selectedCity changes
  const availableAreas = useMemo(() => {
    return selectedCity.areas || ["All Areas"];
  }, [selectedCity]);

  // Filter vendors by city and sub-area
  const filteredVendors = useMemo(() => {
    let list = AREA_VENDORS.filter(v => v.cityId === selectedCity.id);

    if (filterArea !== 'All Areas') {
      list = list.filter(v => v.area.toLowerCase().includes(filterArea.toLowerCase()));
    }

    // Sort
    return [...list].sort((a, b) => {
      if (sortBy === 'price_low') {
        return a.turnkeyPerKw - b.turnkeyPerKw;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (sortBy === 'fastest') {
        const daysA = parseInt(a.netMeteringDays) || 40;
        const daysB = parseInt(b.netMeteringDays) || 40;
        return daysA - daysB;
      }
      return b.rating - a.rating; // recommended default
    });
  }, [selectedCity, filterArea, sortBy]);

  // Handle WhatsApp Link Generator
  const getWhatsAppLink = (vendor) => {
    const kw = parseFloat(exactSystemKw) || 5;
    const sysTypeName = selectedSystemType === 'hybrid' ? 'Hybrid (Battery Backup)' : 'On-Grid (Net Metering)';
    const estVendorTotal = Math.round(kw * (vendor.turnkeyPerKw + (selectedSystemType === 'hybrid' ? 28000 : 0)));

    const message = `Assalam o Alaikum ${vendor.name}!\n\nI got an estimate on Orbit Solar Pakistan:\n📍 City & Area: ${vendor.area}, ${selectedCity.name}\n⚡ Required System: ${kw} kW ${sysTypeName}\n🔲 Plates: ${numberOfPanels}x ${selectedPanel.name} (${selectedPanel.watts}W)\n💰 Estimated Turnkey Rate: PKR ${(estVendorTotal / 100000).toFixed(2)} Lakh (Rs. ${vendor.turnkeyPerKw.toLocaleString()}/kW)\n\nPlease share your official turnkey quotation, availability, and site survey schedule. Thank you!`;

    return `https://wa.me/${vendor.whatsapp}?text=${encodeURIComponent(message)}`;
  };

  const handleCopyPhone = (vendor) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(vendor.phone);
      setCopiedVendorId(vendor.id);
      setTimeout(() => setCopiedVendorId(null), 2500);
    }
  };

  return (
    <div id="area-vendors" className="area-vendors-container">
      {/* Header Banner - Clean Minimal */}
      <div className="vendors-header-clean">
        <div className="vendors-header-text">
          <div className="vendors-kicker-row">
            <span className="live-status-pill">
              <span className="live-ping" /> Live Verified Rates
            </span>
            <span className="location-tag">
              📍 {selectedCity.name} ({selectedCity.disco})
            </span>
          </div>
          <h3 className="vendors-heading">
            Verified Solar Installers & Turnkey Rates
          </h3>
          <p className="vendors-subheading">
            Realtime turnkey package estimates for your <strong>{exactSystemKw} kW</strong> system with <strong>{selectedPanel.brand}</strong> panels. Direct installer contact with zero middleman markup.
          </p>
        </div>

        {/* Minimal Market Benchmark Pill */}
        <div className="market-benchmark-pill">
          <span className="benchmark-label">Market Benchmark ({selectedCity.name.split(' ')[0]})</span>
          <div className="benchmark-price">
            Rs. {selectedPanel.pricePerWatt} <span className="benchmark-unit">/ W</span>
          </div>
          <span className="benchmark-turnkey-hint">Turnkey: ~Rs. 114k - 122k/kW</span>
        </div>
      </div>

      {/* Sub-Area Filter Pills & Sorting Bar */}
      <div className="vendors-filter-bar">
        <div className="sub-area-pills-wrap">
          <span className="filter-label">Filter Area:</span>
          <div className="sub-area-pills">
            {availableAreas.map(area => (
              <button
                key={area}
                type="button"
                className={`area-pill-btn ${filterArea === area ? 'is-active' : ''}`}
                onClick={() => setFilterArea(area)}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        <div className="sort-controls">
          <label htmlFor="vendor-sort" className="sort-label">Sort By:</label>
          <select
            id="vendor-sort"
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recommended">⭐ Top Rated (Recommended)</option>
            <option value="price_low">💰 Lowest Turnkey Price</option>
            <option value="rating">🏆 Customer Satisfaction</option>
            <option value="fastest">⚡ Fastest Net Metering</option>
          </select>
        </div>
      </div>

      {/* Vendors Cards Grid */}
      {filteredVendors.length === 0 ? (
        <div className="no-vendors-found">
          <p>No specific vendors listed for "{filterArea}". Showing all vendors in {selectedCity.name}.</p>
          <button type="button" className="btn-reset-filter" onClick={() => setFilterArea('All Areas')}>
            View All {selectedCity.name} Vendors
          </button>
        </div>
      ) : (
        <div className="vendors-cards-grid">
          {filteredVendors.map((vendor, index) => {
            const kw = parseFloat(exactSystemKw) || 5;
            const extraHybridPerKw = selectedSystemType === 'hybrid' ? 28000 : 0;
            const turnkeyRateForKw = vendor.turnkeyPerKw + extraHybridPerKw;
            const estimatedTotalCost = Math.round(kw * turnkeyRateForKw);

            return (
              <div key={vendor.id} className={`vendor-card-clean ${index === 0 ? 'top-pick-card' : ''}`}>
                {/* Header Row: Vendor Info (Left) + Pricing (Right) */}
                <div className="vendor-card-header">
                  <div className="vendor-info-side">
                    <div className="vendor-title-row">
                      <h4 className="vendor-title">{vendor.name}</h4>
                      {index === 0 && (
                        <span className="top-choice-badge">★ Top Rated</span>
                      )}
                      <span className="pec-licensed-badge">✓ {vendor.pecReg}</span>
                    </div>

                    <div className="vendor-meta-strip">
                      <span className="meta-item loc">📍 {vendor.area}</span>
                      <span className="meta-sep">•</span>
                      <span className="meta-item rating">★ {vendor.rating} <span className="reviews">({vendor.reviewsCount})</span></span>
                      <span className="meta-sep">•</span>
                      <span className="meta-item completed">{vendor.completedProjects} installs</span>
                    </div>

                    <p className="vendor-address-sub">{vendor.address}</p>
                  </div>

                  {/* Clean Price Hero (Direct, no heavy inner box) */}
                  <div className="vendor-price-side">
                    <span className="price-side-label">Turnkey Package ({kw} kW)</span>
                    <div className="price-side-val">
                      PKR {(estimatedTotalCost / 100000).toFixed(2)} <span className="price-side-unit">Lakh</span>
                    </div>
                    <div className="price-side-rates">
                      Rs. {turnkeyRateForKw.toLocaleString()}/kW • Rs. {vendor.panelPerWattWholesale}/W
                    </div>
                  </div>
                </div>

                {/* Middle Row: Inclusions / Specs as clean pills */}
                <div className="vendor-specs-strip">
                  <span className="spec-chip">⚡ {vendor.featuredBrands.join(', ')}</span>
                  <span className="spec-chip">🛡️ {vendor.warranties}</span>
                  <span className="spec-chip highlight">📋 Net Metering: {vendor.netMeteringDays}</span>
                  <span className="spec-chip">📦 {vendor.stockStatus}</span>
                </div>

                {/* Actions Footer */}
                <div className="vendor-card-actions">
                  <div className="actions-main-group">
                    <a
                      href={getWhatsAppLink(vendor)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="clean-btn whatsapp-action-btn"
                    >
                      <span>💬 WhatsApp Direct Quote</span>
                    </a>

                    <button
                      type="button"
                      className="clean-btn survey-action-btn"
                      onClick={() => onOpenQuoteModal({
                        vendor,
                        systemKw: exactSystemKw,
                        panel: selectedPanel,
                        totalCost: estimatedTotalCost,
                        city: selectedCity
                      })}
                    >
                      <span>📋 Request Free Survey</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    className="vendor-tel-btn"
                    onClick={() => handleCopyPhone(vendor)}
                    title="Click to copy phone number"
                  >
                    <span>📞 {copiedVendorId === vendor.id ? 'Copied!' : vendor.phone}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trust & Verification Footer Strip */}
      <div className="vendors-trust-strip">
        <div className="trust-item">
          <span className="trust-icon">🛡️</span>
          <div>
            <strong>100% Verified PEC EPCs:</strong> All listed vendors are checked for Tier-1 solar panel authenticity and official manufacturer barcodes.
          </div>
        </div>
        <div className="trust-item">
          <span className="trust-icon">📑</span>
          <div>
            <strong>Net Metering Assistance:</strong> Vendors manage all WAPDA/DISCO documentation, green meter procurement, and testing fees.
          </div>
        </div>
        <div className="trust-item">
          <span className="trust-icon">🤝</span>
          <div>
            <strong>Zero Middleman Commission:</strong> Connect directly with authorized distributors and regional EPC contractors for the best wholesale rates.
          </div>
        </div>
      </div>
    </div>
  );
}
