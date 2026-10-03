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
      {/* Header Banner */}
      <div className="area-vendors-header">
        <div className="vendors-header-main">
          <div className="header-badges-row">
            <span className="live-verified-badge">
              <span className="live-ping"></span> Live Rate List 2024-2026
            </span>
            <span className="location-pill">
              📍 {selectedCity.name} ({selectedCity.disco})
            </span>
          </div>
          <h3>Verified Solar Vendors & Rate List in {selectedCity.name}</h3>
          <p className="vendors-header-sub">
            Realtime verified rates for your <strong>{exactSystemKw} kW</strong> system with <strong>{selectedPanel.brand}</strong> panels. Contact vendors directly for immediate site inspection & turnkey installation.
          </p>
        </div>

        {/* Live Market Price Badge for This Area */}
        <div className="market-benchmark-card">
          <div className="benchmark-title">Today's Market Rate ({selectedCity.name.split(' ')[0]})</div>
          <div className="benchmark-rate-val">
            Rs. {selectedPanel.pricePerWatt} <span className="rate-unit">/ Watt</span>
          </div>
          <div className="benchmark-sub">
            Turnkey: ~Rs. 114k - 122k / kW
          </div>
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
              <div key={vendor.id} className={`vendor-rate-card ${index === 0 ? 'is-top-pick' : ''}`}>
                {index === 0 && (
                  <div className="top-vendor-ribbon">
                    🏆 Top Rated in {selectedCity.name.split(' ')[0]}
                  </div>
                )}

                {/* Top Section */}
                <div className="vendor-card-top">
                  <div className="vendor-info-block">
                    <div className="vendor-name-row">
                      <h4 className="vendor-name">{vendor.name}</h4>
                      <span className="pec-badge" title="Pakistan Engineering Council Registered">
                        ✓ {vendor.pecReg}
                      </span>
                    </div>

                    <div className="vendor-meta-row">
                      <span className="vendor-area-tag">📍 {vendor.area}</span>
                      <span className="vendor-projects-tag">✓ {vendor.completedProjects} Completed</span>
                      <span className="vendor-rating-tag">★ {vendor.rating} ({vendor.reviewsCount})</span>
                    </div>

                    <p className="vendor-address-txt">{vendor.address}</p>
                  </div>

                  {/* Turnkey Price Calculation for this exact system */}
                  <div className="vendor-pricing-highlight">
                    <span className="turnkey-label">Estimated Turnkey Package</span>
                    <div className="vendor-big-price">
                      PKR {(estimatedTotalCost / 100000).toFixed(2)} <span className="lakh-unit">Lakh</span>
                    </div>
                    <div className="vendor-rate-breakdown">
                      <span>Rate: <strong>Rs. {turnkeyRateForKw.toLocaleString()}</strong> / kW</span>
                      <span className="bullet-sep">•</span>
                      <span>Panels: <strong>Rs. {vendor.panelPerWattWholesale}</strong> / W</span>
                    </div>
                  </div>
                </div>

                {/* Features & Equipment Included */}
                <div className="vendor-specs-row">
                  <div className="spec-pill">
                    <span className="spec-icon">⚡</span>
                    <span>Brands: {vendor.featuredBrands.join(', ')}</span>
                  </div>
                  <div className="spec-pill">
                    <span className="spec-icon">🛡️</span>
                    <span>{vendor.warranties}</span>
                  </div>
                  <div className="spec-pill green-tint">
                    <span className="spec-icon">📋</span>
                    <span>Net Metering: {vendor.netMeteringDays}</span>
                  </div>
                  <div className="spec-pill pulse-tint">
                    <span className="spec-icon">📦</span>
                    <span>{vendor.stockStatus}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="vendor-actions-row">
                  <a
                    href={getWhatsAppLink(vendor)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="vendor-btn whatsapp-btn"
                  >
                    <span className="btn-icon">💬</span>
                    <span>WhatsApp Quote</span>
                  </a>

                  <button
                    type="button"
                    className="vendor-btn quote-btn"
                    onClick={() => onOpenQuoteModal({
                      vendor,
                      systemKw: exactSystemKw,
                      panel: selectedPanel,
                      totalCost: estimatedTotalCost,
                      city: selectedCity
                    })}
                  >
                    <span className="btn-icon">📝</span>
                    <span>Request Free Survey</span>
                  </button>

                  <button
                    type="button"
                    className="vendor-btn call-btn"
                    onClick={() => handleCopyPhone(vendor)}
                    title="Click to copy phone number"
                  >
                    <span className="btn-icon">📞</span>
                    <span>{copiedVendorId === vendor.id ? 'Copied!' : vendor.phone}</span>
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
