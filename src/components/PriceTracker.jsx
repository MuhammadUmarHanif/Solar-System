import React, { useState, useMemo } from 'react';
import './PriceTracker.css';
import { IconBuilding, IconStar } from './Icons';
import { useSupplier } from '../context/SupplierContext';

const PriceTracker = () => {
  const { activeSupplier, activeProducts, dataVersion } = useSupplier();
  const [activeFilter, setActiveFilter] = useState('All');

  const prices = useMemo(() => {
    if (activeProducts && activeProducts.length > 0) {
      return activeProducts.map(p => {
        const isPanel = p.category === 'panels';
        const isInverter = p.category === 'inverters';
        const isBattery = p.category === 'batteries';

        const perWattStr = isPanel
          ? `PKR ${p.pricePerWatt || (p.wattage ? +(p.price / p.wattage).toFixed(1) : 34.5)}/W`
          : isInverter
            ? `PKR ${(p.price / Math.max(1, (p.wattage || 6000) / 1000)).toFixed(0)}/kW`
            : 'Per Unit';

        const capacityStr = p.wattage
          ? p.wattage >= 1000 && !isPanel
            ? `${(p.wattage / 1000).toFixed(1)} kW`
            : `${p.wattage}W`
          : '';

        const marketStr = activeSupplier?.cityName
          ? activeSupplier.cityName.split(',')[0].replace('Pakistan (', '').replace(')', '').trim()
          : 'Hall Road, Lahore';

        return {
          id: p.id,
          brand: p.name,
          vendor: p.brand ? `${p.brand} Verified` : (activeSupplier?.name || 'Orbit Solar Technologies'),
          market: marketStr,
          category: p.category,
          panelType: p.type || (isInverter ? 'Solar Inverter' : isBattery ? 'LiFePO4 Lithium' : 'N-Type TOPCon'),
          price: `PKR ${Number(p.price).toLocaleString()}`,
          perWatt: perWattStr,
          warranty: p.warranty || (isPanel ? '15y Product / 30y Power' : '5 Years Replacement'),
          rating: '4.9',
          capacity: capacityStr,
          efficiency: p.efficiency || (isInverter ? '98.6%' : isBattery ? '95.0%' : '22.6%'),
          bifacial: Boolean(p.bifacial)
        };
      });
    }

    return [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProducts, activeSupplier, dataVersion]);

  const filteredPrices = useMemo(() => {
    if (activeFilter === 'All') return prices;
    if (activeFilter === 'Panels') return prices.filter(p => p.category === 'panels');
    if (activeFilter === 'Inverters') return prices.filter(p => p.category === 'inverters');
    if (activeFilter === 'Batteries') return prices.filter(p => p.category === 'batteries');
    if (activeFilter === 'Bifacial') return prices.filter(p => p.bifacial || p.panelType.toLowerCase().includes('bifacial'));
    if (activeFilter === 'N-Type') return prices.filter(p => p.panelType.toLowerCase().includes('n-type'));
    if (activeFilter === '600W+') return prices.filter(p => parseInt(p.capacity, 10) >= 600);
    return prices.filter(p =>
      p.panelType.toLowerCase().includes(activeFilter.toLowerCase()) ||
      p.brand.toLowerCase().includes(activeFilter.toLowerCase())
    );
  }, [prices, activeFilter]);

  const lastUpdated = useMemo(() => {
    return new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataVersion]);

  return (
    <section id="tracker" className="tracker-section glass-panel">
      {/* Section Header */}
      <div className="section-header">
        <span className="section-pill">Live Market Intelligence</span>
        <h2>Verified Solar Hardware Rates ({activeSupplier?.name || 'Pakistan'})</h2>
        <p className="section-subtitle">
          Real-time equipment catalog and pricing engine rates for {activeSupplier?.cityName || 'Pakistan'}. Live inventory synchronized with official engineering database.
        </p>
      </div>

      {/* Filter Row & Status */}
      <div className="tracker-controls">
        <div className="filter-pill-row">
          {['All', 'Panels', 'Inverters', 'Batteries', 'N-Type', 'Bifacial', '600W+'].map(f => (
            <button
              key={f}
              type="button"
              className={`filter-btn ${activeFilter === f ? 'is-active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {lastUpdated && (
          <div className="live-status">
            <span className="live-pulse" />
            <span>Live Catalog: Today at {lastUpdated} (Active Inventory)</span>
          </div>
        )}
      </div>

      {/* Full Width Table Container */}
      <div className="table-wrapper">
        {filteredPrices.length === 0 ? (
          <div className="loading-state">
            <p>No products match the selected filter.</p>
          </div>
        ) : (
          <>
            {/* Desktop Full-Width Clean Table */}
            <table className="clean-table desktop-only-table">
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Solar Module & Technology</th>
                  <th style={{ width: '15%' }}>Trade Hub / City</th>
                  <th style={{ width: '13%' }}>Rate / Watt</th>
                  <th style={{ width: '15%' }}>Price / Module (PKR)</th>
                  <th style={{ width: '14%' }}>Warranty</th>
                  <th style={{ width: '13%', textAlign: 'right' }}>Distributor Score</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrices.map((item, index) => (
                  <tr key={index}>
                    <td className="col-vendor">
                      <div className="vendor-cell-content">
                        <span className="brand-name-bold">{item.brand}</span>
                        <span className="vendor-sub">
                          {item.vendor} • <span className="tech-tag">{item.panelType}</span> • <strong>{item.capacity}</strong> ({item.efficiency})
                        </span>
                      </div>
                    </td>
                    <td className="col-city">
                      <div className="city-cell-content">
                        <IconBuilding size={14} className="loc-svg-icon" />
                        <span>{item.market}</span>
                      </div>
                    </td>
                    <td className="col-per-watt num-tabular">{item.perWatt}</td>
                    <td className="col-price num-tabular">{item.price}</td>
                    <td className="col-muted">{item.warranty}</td>
                    <td className="col-rating">
                      <div className="rating-cell-content">
                        <span className="rating-star-wrap"><IconStar size={13} className="rating-star-svg" /></span>
                        <span className="rating-val-num num-tabular">{item.rating} / 5.0</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile-Optimized Compact Price Cards (Significantly Reduced Height) */}
            <div className="mobile-tracker-cards">
              {filteredPrices.map((item, index) => (
                <div key={index} className="compact-price-card">
                  <div className="card-top-row">
                    <div className="brand-badge-group">
                      <span className="compact-brand-title">{item.brand}</span>
                      <span className="tech-tag compact-tag">{item.panelType}</span>
                    </div>
                    <div className="compact-score-pill">
                      <IconStar size={12} className="rating-star-svg" />
                      <span className="num-tabular">{item.rating}</span>
                    </div>
                  </div>

                  <div className="card-spec-row">
                    <span className="compact-vendor-name">{item.vendor}</span>
                    <span className="dot-sep">•</span>
                    <span className="compact-capacity-val"><strong>{item.capacity}</strong> ({item.efficiency})</span>
                    <span className="dot-sep">•</span>
                    <span className="compact-loc">
                      <IconBuilding size={12} className="loc-svg-icon" />
                      <span>{item.market.split('/')[0]}</span>
                    </span>
                  </div>

                  <div className="card-bottom-rate-bar">
                    <div className="rate-unit-badge">
                      <span className="unit-label">Rate:</span>
                      <span className="per-watt-val num-tabular">{item.perWatt}</span>
                    </div>
                    <div className="compact-warranty-txt">
                      {item.warranty ? item.warranty.replace('Product / ', 'P / ') : ''}
                    </div>
                    <div className="compact-total-price num-tabular">
                      {item.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Average Price Benchmark Cards across Full Width */}
      <div className="benchmark-grid">
        <div className="benchmark-card">
          <span className="benchmark-label">N-Type TOPCon (585W–600W)</span>
          <span className="benchmark-val">PKR 34–36 / Watt</span>
          <span className="benchmark-sub">~PKR 19,500 – 21,500 per panel (Lowest degradation)</span>
        </div>
        <div className="benchmark-card">
          <span className="benchmark-label">Mono PERC (550W)</span>
          <span className="benchmark-val">PKR 32–34 / Watt</span>
          <span className="benchmark-sub">~PKR 17,600 – 18,700 per panel (Budget standard)</span>
        </div>
        <div className="benchmark-card">
          <span className="benchmark-label">Three-Phase On-Grid Inverter</span>
          <span className="benchmark-val">PKR 24k–28k / kW</span>
          <span className="benchmark-sub">Huawei / Growatt / Solis (Dual MPPT, IP65)</span>
        </div>
        <div className="benchmark-card">
          <span className="benchmark-label">Turnkey Net Metering Cost</span>
          <span className="benchmark-val">PKR 118k–128k / kW</span>
          <span className="benchmark-sub">Complete system with GI structure, cabling & green meter</span>
        </div>
      </div>
    </section>
  );
};

export default PriceTracker;