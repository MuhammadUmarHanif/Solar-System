import React, { useState, useMemo } from 'react';
import './SolarCalculator.css';
import {
  PAKISTAN_CITIES,
  SOLAR_PANELS,
  SYSTEM_TYPES,
  STRUCTURE_TYPES,
  BATTERY_OPTIONS,
  INITIAL_APPLIANCES
} from '../data/solarData';
import AreaVendorRateList from './AreaVendorRateList';
import QuoteModal from './QuoteModal';

export default function SolarCalculator() {
  // Input Mode: 'direct_kw' (Recommended), 'bill_rs', 'bill_units', or 'appliances'
  const [inputMode, setInputMode] = useState('direct_kw');

  // Direct KW target (Default 10 kW, very popular for standard 1 Kanal / 10 Marla with ACs)
  const [targetKw, setTargetKw] = useState(10);

  // Alternative Inputs
  const [monthlyBillRs, setMonthlyBillRs] = useState(45000);
  const [monthlyUnits, setMonthlyUnits] = useState(850);
  const [appliances, setAppliances] = useState(INITIAL_APPLIANCES);

  // Average NEPRA tariff in Pakistan (including taxes, fuel price adjustment - FPA, surcharges)
  const avgTariff = 48; // PKR per unit

  // Location / City Selection
  const [selectedCity, setSelectedCity] = useState(PAKISTAN_CITIES[0]); // Default Lahore
  const [selectedArea, setSelectedArea] = useState('All Areas');

  // System Configuration
  const [selectedSystemType, setSelectedSystemType] = useState('ongrid'); // 'ongrid' | 'hybrid'
  const [selectedPanel, setSelectedPanel] = useState(SOLAR_PANELS[0]); // Default Jinko 585W TOPCon
  const [selectedStructure, setSelectedStructure] = useState(STRUCTURE_TYPES[0]); // Standard L2/L3
  const [selectedBattery, setSelectedBattery] = useState(BATTERY_OPTIONS[1]); // 5.12 kWh LiFePO4

  // Interactive Quote Modal state
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [activeQuoteData, setActiveQuoteData] = useState(null);

  // Appliance quantity update
  const updateQuantity = (id, delta) => {
    setAppliances(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
    ));
  };

  // Sync bill Rs and Units
  const handleBillRsChange = (val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setMonthlyBillRs(num);
    setMonthlyUnits(Math.round(num / avgTariff));
  };

  const handleUnitsChange = (val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setMonthlyUnits(num);
    setMonthlyBillRs(num * avgTariff);
  };

  // Quick Preset Handlers
  const applyHousePreset = (preset) => {
    if (preset === '5marla') {
      setInputMode('direct_kw');
      setTargetKw(3.5);
    } else if (preset === '10marla') {
      setInputMode('direct_kw');
      setTargetKw(7);
    } else if (preset === '1kanal') {
      setInputMode('direct_kw');
      setTargetKw(10);
    } else if (preset === '2kanal') {
      setInputMode('direct_kw');
      setTargetKw(15);
    }
  };

  // Live Auto Calculation
  const calculatedResults = useMemo(() => {
    let requiredDcKw = 0;
    const derateFactor = 0.80; // 20% system losses (dust, inverter, temperature coefficient)
    const sunHours = selectedCity.sunHours;

    if (inputMode === 'direct_kw') {
      requiredDcKw = targetKw;
    } else if (inputMode === 'bill_rs') {
      const units = monthlyBillRs / avgTariff;
      const dailyKwhNeeded = units / 30;
      requiredDcKw = (dailyKwhNeeded / sunHours) / derateFactor;
    } else if (inputMode === 'bill_units') {
      const dailyKwhNeeded = monthlyUnits / 30;
      requiredDcKw = (dailyKwhNeeded / sunHours) / derateFactor;
    } else {
      let totalDailyWattHours = 0;
      appliances.forEach(a => {
        totalDailyWattHours += a.watts * a.quantity * a.hours;
      });
      const dailyKwhNeeded = totalDailyWattHours / 1000;
      requiredDcKw = (dailyKwhNeeded / sunHours) / derateFactor;
    }

    if (requiredDcKw <= 0) requiredDcKw = 3.5;

    // Number of Panels required
    const panelWatts = selectedPanel.watts;
    const numberOfPanels = Math.max(4, Math.ceil((requiredDcKw * 1000) / panelWatts));
    const exactSystemKw = (numberOfPanels * panelWatts) / 1000;

    // Matching Inverter
    let inverterKw = 3.6;
    let inverterName = "3.6 kW Single-Phase Inverter";
    let inverterCost = 145000;

    if (exactSystemKw > 24) {
      inverterKw = 30;
      inverterName = "30 kW Three-Phase Industrial Inverter (Sungrow / Huawei)";
      inverterCost = 480000;
    } else if (exactSystemKw > 18) {
      inverterKw = 20;
      inverterName = "20 kW Three-Phase Inverter (Sungrow / Huawei / Solis)";
      inverterCost = 390000;
    } else if (exactSystemKw > 13) {
      inverterKw = 15;
      inverterName = "15 kW Three-Phase Inverter (Sungrow / Huawei / Solis)";
      inverterCost = 310000;
    } else if (exactSystemKw > 8.5) {
      inverterKw = 10;
      inverterName = "10 kW Three-Phase Inverter (Sungrow / Huawei / Solis)";
      inverterCost = 225000;
    } else if (exactSystemKw > 5.5) {
      inverterKw = 8;
      inverterName = "8 kW Three-Phase Inverter (Solis / Knox / Sungrow)";
      inverterCost = 195000;
    } else if (exactSystemKw > 3.8) {
      inverterKw = 6;
      inverterName = "6 kW Dual-MPPT Inverter (Inverex Nitrox / Solis)";
      inverterCost = 175000;
    }

    // Bill of Materials (BOM) itemized breakdown
    const panelsCost = numberOfPanels * selectedPanel.price;
    const structureCost = Math.round(exactSystemKw * 1000 * selectedStructure.costPerWatt);
    const cablesAndProtections = Math.round(38000 + (exactSystemKw * 5800)); // AC/DC Schneider/Terasaki breakers, SPD, copper cables
    const netMeteringCost = selectedSystemType === 'ongrid' ? 115000 : 85000; // DISCO green meter, earthing, inspection, paperwork
    const batteryCost = selectedSystemType === 'hybrid' ? selectedBattery.price : 0;
    const installationLabor = Math.round(26000 + (exactSystemKw * 2800)); // Professional civil + electrical mounting

    const turnkeySubtotal = panelsCost + inverterCost + structureCost + cablesAndProtections + netMeteringCost + batteryCost + installationLabor;
    const totalEstimatedCostMin = Math.round(turnkeySubtotal * 0.96);
    const totalEstimatedCostMax = Math.round(turnkeySubtotal * 1.04);

    // Generation Stats
    const dailyGeneratedUnits = (exactSystemKw * sunHours * derateFactor).toFixed(1);
    const monthlyGeneratedUnits = Math.round(exactSystemKw * sunHours * 30 * derateFactor);
    const monthlySavings = Math.round(monthlyGeneratedUnits * avgTariff);
    const yearlySavings = monthlySavings * 12;
    const lifetime25YrSavings = yearlySavings * 25;

    // Financial Return
    const paybackYears = (totalEstimatedCostMin / Math.max(1, yearlySavings)).toFixed(1);
    const roofAreaSqFt = Math.round(numberOfPanels * 23.5); // ~23.5 sq ft per 550W+ module with walking clearance
    const co2OffsetTonnes = (monthlyGeneratedUnits * 12 * 0.0007).toFixed(1);

    return {
      systemKw: exactSystemKw.toFixed(1),
      requiredDcKw: requiredDcKw.toFixed(1),
      numberOfPanels,
      panelModel: selectedPanel.name,
      inverterName,
      inverterKw,
      inverterCost,
      panelsCost,
      structureCost,
      cablesAndProtections,
      netMeteringCost,
      batteryCost,
      installationLabor,
      dailyGeneratedUnits,
      monthlyGeneratedUnits,
      monthlySavings,
      yearlySavings,
      lifetime25YrSavings,
      totalEstimatedCostMin,
      totalEstimatedCostMax,
      turnkeySubtotal,
      paybackYears,
      roofAreaSqFt,
      co2OffsetTonnes
    };
  }, [inputMode, targetKw, monthlyBillRs, monthlyUnits, appliances, selectedCity, selectedSystemType, selectedPanel, selectedStructure, selectedBattery]);

  // Open modal handler
  const handleOpenQuoteModal = (quotePayload) => {
    setActiveQuoteData(quotePayload);
    setIsQuoteModalOpen(true);
  };

  return (
    <section id="calculator" className="calculator-section glass-panel">
      {/* Friendly Header with Urdu & English Context */}
      <div className="section-header">
        <span className="section-pill">⚡ Pakistan Solar Calculator & Area Vendors</span>
        <h2>Calculate Your Solar System & Instant Vendor Rates</h2>
        <p className="section-subtitle">
          Select your <strong>City & Area</strong>, choose your <strong>Required KW & Solar Plates</strong>, get an accurate instant estimate, and compare verified local vendor rate lists with live real-time market data.
        </p>
      </div>

      {/* 4-Step Interactive Visual Progression Bar */}
      <div className="calc-steps-tracker">
        <div className="calc-step-item active">
          <span className="step-num">1</span>
          <span className="step-text">Select Area & City</span>
        </div>
        <div className="step-arrow">→</div>
        <div className="calc-step-item active">
          <span className="step-num">2</span>
          <span className="step-text">Choose Plates & KW</span>
        </div>
        <div className="step-arrow">→</div>
        <div className="calc-step-item active">
          <span className="step-num">3</span>
          <span className="step-text">Get Live Estimate</span>
        </div>
        <div className="step-arrow">→</div>
        <div className="calc-step-item active">
          <span className="step-num">4</span>
          <span className="step-text">Area Vendor Rate List</span>
        </div>
      </div>

      {/* STEP 1: Top Prominent Area / City Selector */}
      <div className="area-selection-hero-bar">
        <div className="area-select-left">
          <span className="area-pin-icon">📍</span>
          <div className="area-select-label-wrap">
            <span className="area-micro-tag">Step 1: Your Location & DISCO</span>
            <label htmlFor="city-select-dropdown" className="area-heading">
              Select Your City / Region:
            </label>
          </div>
        </div>

        <div className="area-select-controls">
          <select
            id="city-select-dropdown"
            className="city-hero-dropdown"
            value={selectedCity.id}
            onChange={(e) => {
              const found = PAKISTAN_CITIES.find(c => c.id === e.target.value);
              if (found) {
                setSelectedCity(found);
                setSelectedArea('All Areas');
              }
            }}
          >
            {PAKISTAN_CITIES.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.disco}) — {c.sunHours} Sun Hours
              </option>
            ))}
          </select>

          <div className="city-sunshine-badge" title="Average daily peak sunshine irradiance in this region">
            <span className="sun-icon">☀️</span>
            <span>{selectedCity.sunHours} hrs/day Peak Sun</span>
          </div>
        </div>
      </div>

      {/* STEP 2: Input Mode Tabs */}
      <div className="input-mode-tabs-container">
        <div className="input-mode-tabs">
          {/* Direct KW Selector (Primary Choice) */}
          <button
            type="button"
            className={`mode-tab-btn ${inputMode === 'direct_kw' ? 'is-active' : ''}`}
            onClick={() => setInputMode('direct_kw')}
          >
            <span className="tab-icon">⚡</span>
            <div className="tab-text">
              <strong>Select Plates & KW (Recommended)</strong>
              <span>Choose directly: 3kW, 5kW, 10kW, 15kW...</span>
            </div>
          </button>

          <button
            type="button"
            className={`mode-tab-btn ${inputMode === 'bill_rs' ? 'is-active' : ''}`}
            onClick={() => setInputMode('bill_rs')}
          >
            <span className="tab-icon">💳</span>
            <div className="tab-text">
              <strong>Monthly Bill (in Rupees)</strong>
              <span>e.g. Rs. 40,000 / month</span>
            </div>
          </button>

          <button
            type="button"
            className={`mode-tab-btn ${inputMode === 'bill_units' ? 'is-active' : ''}`}
            onClick={() => setInputMode('bill_units')}
          >
            <span className="tab-icon">📊</span>
            <div className="tab-text">
              <strong>Electricity Units (kWh)</strong>
              <span>e.g. 600 or 1,000 Units</span>
            </div>
          </button>

          <button
            type="button"
            className={`mode-tab-btn ${inputMode === 'appliances' ? 'is-active' : ''}`}
            onClick={() => setInputMode('appliances')}
          >
            <span className="tab-icon">🏠</span>
            <div className="tab-text">
              <strong>By Home Appliances</strong>
              <span>ACs, Fans, Fridge, Water Motor...</span>
            </div>
          </button>
        </div>

        {/* Quick House Size Presets */}
        <div className="house-presets-bar">
          <span className="presets-label">Quick House Size Shortcuts:</span>
          <button type="button" className="house-preset-btn" onClick={() => applyHousePreset('5marla')}>
            🏠 5 Marla (~3.5 kW)
          </button>
          <button type="button" className="house-preset-btn" onClick={() => applyHousePreset('10marla')}>
            🏡 10 Marla (~7 kW)
          </button>
          <button type="button" className="house-preset-btn" onClick={() => applyHousePreset('1kanal')}>
            🏰 1 Kanal (~10 kW)
          </button>
          <button type="button" className="house-preset-btn" onClick={() => applyHousePreset('2kanal')}>
            👑 2 Kanal (~15 kW)
          </button>
        </div>
      </div>

      {/* Two Column Grid for Configuration & Calculation */}
      <div className="calculator-grid">
        {/* Left Column: Sizing Parameters */}
        <div className="column-card input-column">
          {/* MODE 1: Direct KW Selection */}
          {inputMode === 'direct_kw' && (
            <div className="input-block-card">
              <div className="card-top-title">
                <h3>How many Kilowatts (KW) of solar do you need?</h3>
                <span className="helper-badge">System Capacity</span>
              </div>
              <p className="simple-guide-text">
                Select your required system size. We automatically compute the exact number of plates and inverter specs:
              </p>

              <div className="big-value-display-box">
                <input
                  type="number"
                  step="0.5"
                  min="2"
                  max="50"
                  className="big-number-input"
                  value={targetKw}
                  onChange={(e) => setTargetKw(Math.max(1, parseFloat(e.target.value) || 1))}
                />
                <span className="currency-label" style={{ fontSize: '1.6rem', marginLeft: '8px' }}>
                  kW System
                </span>
              </div>

              {/* KW Slider */}
              <input
                type="range"
                min="3"
                max="30"
                step="1"
                className="clean-slider"
                value={targetKw}
                onChange={(e) => setTargetKw(parseFloat(e.target.value))}
              />

              <div className="slider-hints-row">
                <span>3 kW</span>
                <span>5 kW</span>
                <span>10 kW (Standard)</span>
                <span>15 kW</span>
                <span>30 kW</span>
              </div>

              {/* Quick Select Buttons */}
              <div className="quick-amount-pills">
                {[3, 5, 7, 10, 12, 15, 20, 25].map(kw => (
                  <button
                    key={kw}
                    type="button"
                    className={`amt-pill ${targetKw === kw ? 'is-selected' : ''}`}
                    onClick={() => setTargetKw(kw)}
                  >
                    {kw} kW
                  </button>
                ))}
              </div>

              <div className="calculated-unit-hint">
                💡 A <strong>{targetKw} kW</strong> system requires approximately <strong>{calculatedResults.numberOfPanels} plates</strong> ({selectedPanel.watts}W) and produces ~<strong>{calculatedResults.monthlyGeneratedUnits} units/month</strong> in {selectedCity.name.split(' ')[0]}.
              </div>
            </div>
          )}

          {/* MODE 2: Monthly Bill in Rupees */}
          {inputMode === 'bill_rs' && (
            <div className="input-block-card">
              <div className="card-top-title">
                <h3>What is your average monthly electricity bill?</h3>
                <span className="helper-badge">WAPDA / K-Electric Bill</span>
              </div>
              <p className="simple-guide-text">
                Enter your average summer bill to size a system that makes your bill zero:
              </p>

              <div className="big-value-display-box">
                <span className="currency-label">PKR</span>
                <input
                  type="number"
                  step="1000"
                  min="5000"
                  max="500000"
                  className="big-number-input"
                  value={monthlyBillRs}
                  onChange={(e) => handleBillRsChange(e.target.value)}
                />
                <span className="time-badge">/ Month</span>
              </div>

              <input
                type="range"
                min="10000"
                max="150000"
                step="2000"
                className="clean-slider"
                value={monthlyBillRs}
                onChange={(e) => handleBillRsChange(e.target.value)}
              />

              <div className="slider-hints-row">
                <span>Rs. 10,000 (~3kW)</span>
                <span>Rs. 40,000 (~6kW)</span>
                <span>Rs. 80,000 (~10kW)</span>
                <span>Rs. 150,000+</span>
              </div>

              <div className="quick-amount-pills">
                {[20000, 35000, 50000, 75000, 100000, 150000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    className={`amt-pill ${monthlyBillRs === amt ? 'is-selected' : ''}`}
                    onClick={() => handleBillRsChange(amt)}
                  >
                    Rs. {(amt / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>

              <div className="calculated-unit-hint">
                💡 This bill equals approximately <strong>{monthlyUnits} Units (kWh)</strong> per month at current NEPRA tariffs.
              </div>
            </div>
          )}

          {/* MODE 3: Monthly Units */}
          {inputMode === 'bill_units' && (
            <div className="input-block-card">
              <div className="card-top-title">
                <h3>How many electricity units do you consume monthly?</h3>
                <span className="helper-badge">Units From Bill (kWh)</span>
              </div>
              <p className="simple-guide-text">
                Check the "Units Consumed" on your recent electricity bill:
              </p>

              <div className="big-value-display-box">
                <input
                  type="number"
                  step="25"
                  min="50"
                  max="5000"
                  className="big-number-input"
                  value={monthlyUnits}
                  onChange={(e) => handleUnitsChange(e.target.value)}
                />
                <span className="currency-label" style={{ fontSize: '1.2rem', marginLeft: '8px' }}>
                  Units / Month
                </span>
              </div>

              <input
                type="range"
                min="150"
                max="3000"
                step="25"
                className="clean-slider"
                value={monthlyUnits}
                onChange={(e) => handleUnitsChange(e.target.value)}
              />

              <div className="slider-hints-row">
                <span>200 Units</span>
                <span>600 Units (~5kW)</span>
                <span>1200 Units (~10kW)</span>
                <span>3000+ Units</span>
              </div>

              <div className="quick-amount-pills">
                {[300, 500, 700, 1000, 1500, 2000].map(u => (
                  <button
                    key={u}
                    type="button"
                    className={`amt-pill ${monthlyUnits === u ? 'is-selected' : ''}`}
                    onClick={() => handleUnitsChange(u)}
                  >
                    {u} Units
                  </button>
                ))}
              </div>

              <div className="calculated-unit-hint">
                💡 Consuming {monthlyUnits} units costs approximately <strong>PKR {monthlyBillRs.toLocaleString()}</strong> every month.
              </div>
            </div>
          )}

          {/* MODE 4: Appliances */}
          {inputMode === 'appliances' && (
            <div className="input-block-card">
              <div className="card-top-title">
                <h3>What appliances do you want to run on solar?</h3>
                <button
                  type="button"
                  className="simple-reset-btn"
                  onClick={() => setAppliances(prev => prev.map(a => ({ ...a, quantity: 0 })))}
                >
                  Reset all to 0
                </button>
              </div>
              <p className="simple-guide-text">
                Adjust the quantity (+ / −) for each appliance below:
              </p>

              <div className="appliances-simple-list">
                {appliances.map(appliance => (
                  <div
                    key={appliance.id}
                    className={`appliance-simple-item ${appliance.quantity > 0 ? 'is-active' : ''}`}
                  >
                    <div className="appliance-left">
                      <span className="app-emoji">{appliance.icon}</span>
                      <div className="app-names">
                        <span className="app-english-name">{appliance.name}</span>
                        <span className="app-urdu-name">{appliance.subtext} • {appliance.watts}W</span>
                      </div>
                    </div>

                    <div className="appliance-counter-controls">
                      <button
                        type="button"
                        className="counter-action-btn"
                        onClick={() => updateQuantity(appliance.id, -1)}
                        aria-label="Decrease"
                      >
                        −
                      </button>
                      <span className="counter-number-val">{appliance.quantity}</span>
                      <button
                        type="button"
                        className="counter-action-btn"
                        onClick={() => updateQuantity(appliance.id, 1)}
                        aria-label="Increase"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Solar Plates & Hardware Preferences */}
        <div className="column-card config-column">
          <div className="card-top-title">
            <h3>Solar Plates & System Options</h3>
            <span className="helper-badge">Tier-1 Equipment</span>
          </div>

          <div className="config-fields-simple">
            {/* Solar Plate Brand & Wattage Selection */}
            <div className="simple-field-group">
              <label className="field-label-bold">
                🔲 Select Solar Plates Brand & Wattage:
              </label>
              <div className="panel-choices-list">
                {SOLAR_PANELS.map(p => (
                  <div
                    key={p.id}
                    className={`panel-choice-item ${selectedPanel.id === p.id ? 'is-selected' : ''}`}
                    onClick={() => setSelectedPanel(p)}
                  >
                    <div className="panel-text-block">
                      <div className="panel-name-row">
                        <span className="panel-name-txt">{p.name}</span>
                        {p.bifacial && <span className="bifacial-tag">Bifacial Dual-Glass</span>}
                      </div>
                      <span className="panel-tag-txt">{p.tag}</span>
                      <span className="panel-spec-sub">
                        Efficiency: {p.efficiency} • {p.cellType} • {p.warranty.split('•')[0]}
                      </span>
                    </div>
                    <div className="panel-rate-block">
                      <span className="panel-price-tag">Rs. {p.price.toLocaleString()}</span>
                      <span className="per-plate-sub">Rs. {p.pricePerWatt}/W</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Type Selection */}
            <div className="simple-field-group">
              <label className="field-label-bold">
                ⚡ System Type (On-Grid vs Loadshedding Backup?):
              </label>
              <div className="system-choice-cards">
                {SYSTEM_TYPES.map(sys => (
                  <div
                    key={sys.id}
                    className={`sys-choice-card ${selectedSystemType === sys.id ? 'is-selected' : ''}`}
                    onClick={() => setSelectedSystemType(sys.id)}
                  >
                    <div className="sys-choice-header">
                      <strong>{sys.title}</strong>
                      <span className="green-pill">{sys.badge}</span>
                    </div>
                    <div className="sys-choice-urdu">{sys.subNote}</div>
                    <div className="sys-choice-desc">{sys.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Battery Selection (if Hybrid) */}
            {selectedSystemType === 'hybrid' && (
              <div className="simple-field-group">
                <label className="field-label-bold">
                  🔋 Choose Battery Storage Bank:
                </label>
                <div className="battery-options-list">
                  {BATTERY_OPTIONS.filter(b => b.id !== 'none').map(b => (
                    <div
                      key={b.id}
                      className={`battery-option-card ${selectedBattery.id === b.id ? 'is-selected' : ''}`}
                      onClick={() => setSelectedBattery(b)}
                    >
                      <div>
                        <strong>{b.name}</strong>
                        <p className="battery-desc-txt">{b.desc}</p>
                      </div>
                      <div className="battery-price-tag">
                        +PKR {(b.price / 100000).toFixed(2)} Lakh
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mounting Structure Type */}
            <div className="simple-field-group">
              <label className="field-label-bold">
                🏗️ Roof Mounting Structure:
              </label>
              <div className="structure-options-list">
                {STRUCTURE_TYPES.map(st => (
                  <div
                    key={st.id}
                    className={`structure-card ${selectedStructure.id === st.id ? 'is-selected' : ''}`}
                    onClick={() => setSelectedStructure(st)}
                  >
                    <div>
                      <strong>{st.name}</strong>
                      <p className="structure-desc-txt">{st.subtext}</p>
                    </div>
                    <div className="structure-tag">
                      {st.id === 'standard' ? 'Standard Included' : '+Rs. 15/Watt'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 3: Crystal Clear Live Results Section (BOM & Performance) */}
      <div className="live-results-panel">
        <div className="results-banner-header">
          <div>
            <span className="results-step-pill">Step 3: Instant Live Estimate</span>
            <h3>Your Complete Solar System Turnkey Estimate</h3>
            <p className="results-subtitle-txt">
              Live calculated using real-time wholesale benchmarks in <strong>{selectedCity.name}</strong>:
            </p>
          </div>
          <div className="live-active-indicator">
            <span className="pulsing-green-dot"></span>
            <span>Live Recalculated</span>
          </div>
        </div>

        {/* 4 Big Headline Result Cards */}
        <div className="main-answers-grid">
          {/* Card 1: System Size */}
          <div className="answer-card glow-card">
            <span className="card-top-icon">⚡</span>
            <span className="answer-card-label">Recommended System Size</span>
            <div className="big-highlight-number">
              {calculatedResults.systemKw} <span className="unit-small">kW</span>
            </div>
            <p className="answer-sub-explainer">
              Inverter: <strong>{calculatedResults.inverterName}</strong>
            </p>
          </div>

          {/* Card 2: Number of Panels */}
          <div className="answer-card">
            <span className="card-top-icon">🔲</span>
            <span className="answer-card-label">Total Solar Plates Needed</span>
            <div className="big-highlight-number">
              {calculatedResults.numberOfPanels} <span className="unit-small">Plates</span>
            </div>
            <p className="answer-sub-explainer">
              {selectedPanel.watts}W {selectedPanel.brand} ({selectedPanel.series})
            </p>
          </div>

          {/* Card 3: Total Estimated Turnkey Cost */}
          <div className="answer-card">
            <span className="card-top-icon">💰</span>
            <span className="answer-card-label">Total Turnkey Cost</span>
            <div className="big-highlight-number" style={{ fontSize: '1.65rem' }}>
              PKR {(calculatedResults.totalEstimatedCostMin / 100000).toFixed(2)} - {(calculatedResults.totalEstimatedCostMax / 100000).toFixed(2)} Lakh
            </div>
            <p className="answer-sub-explainer">
              (Includes Panels, Inverter, Stand, Copper Cables, Breakers & Net Metering)
            </p>
          </div>

          {/* Card 4: Monthly Bill Savings */}
          <div className="answer-card green-highlight-card">
            <span className="card-top-icon">💵</span>
            <span className="answer-card-label">Estimated Monthly Bill Savings</span>
            <div className="big-highlight-number text-mint">
              PKR {calculatedResults.monthlySavings.toLocaleString()} <span className="unit-small">/ mo</span>
            </div>
            <p className="answer-sub-explainer">
              Annual Bill Savings: <strong>PKR {calculatedResults.yearlySavings.toLocaleString()}</strong>
            </p>
          </div>
        </div>

        {/* Itemized Bill of Materials (BOM) Breakdown Table */}
        <div className="bom-breakdown-card">
          <div className="bom-header">
            <h4>📋 Complete Turnkey Itemized Cost Breakdown (Estimated)</h4>
            <span className="bom-sub">Transparent hardware & installation costs:</span>
          </div>

          <div className="bom-table-wrap">
            <table className="bom-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Specification</th>
                  <th>Quantity / Rating</th>
                  <th style={{ textAlign: 'right' }}>Est. Cost (PKR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Solar Panels</strong></td>
                  <td>{selectedPanel.name} (Rs. {selectedPanel.pricePerWatt}/W)</td>
                  <td>{calculatedResults.numberOfPanels} Plates ({calculatedResults.systemKw} kW)</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>PKR {calculatedResults.panelsCost.toLocaleString()}</td>
                </tr>
                <tr>
                  <td><strong>Solar Inverter</strong></td>
                  <td>{calculatedResults.inverterName}</td>
                  <td>1 Unit (Tier-1 Pure Sine Wave)</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>PKR {calculatedResults.inverterCost.toLocaleString()}</td>
                </tr>
                <tr>
                  <td><strong>Mounting Structure</strong></td>
                  <td>{selectedStructure.name}</td>
                  <td>Custom Galvanized Iron Frames</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>PKR {calculatedResults.structureCost.toLocaleString()}</td>
                </tr>
                <tr>
                  <td><strong>AC/DC Protection & Cabling</strong></td>
                  <td>Pakistan Cables / Fast Cables pure copper + SPD & Breakers</td>
                  <td>Complete Set + DC Combiner</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>PKR {calculatedResults.cablesAndProtections.toLocaleString()}</td>
                </tr>
                <tr>
                  <td><strong>Net Metering & DISCO Filing</strong></td>
                  <td>Green Meter, Earthing Bores, Testing & LESCO/IESCO Approval</td>
                  <td>Turnkey Processing</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>PKR {calculatedResults.netMeteringCost.toLocaleString()}</td>
                </tr>
                {selectedSystemType === 'hybrid' && (
                  <tr>
                    <td><strong>Battery Storage Bank</strong></td>
                    <td>{selectedBattery.name}</td>
                    <td>1 Bank (LiFePO4 Lithium)</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#00d2ff' }}>PKR {calculatedResults.batteryCost.toLocaleString()}</td>
                  </tr>
                )}
                <tr>
                  <td><strong>Installation & Commissioning</strong></td>
                  <td>Civil mounting, electrical wiring, testing & app setup</td>
                  <td>Complete Labor</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>PKR {calculatedResults.installationLabor.toLocaleString()}</td>
                </tr>
                <tr className="bom-total-row">
                  <td colSpan="3"><strong>Total Turnkey Project Estimate ({selectedCity.name.split(' ')[0]})</strong></td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="bom-total-cost">PKR {(calculatedResults.turnkeySubtotal / 100000).toFixed(2)} Lakh</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3 Detail Metric Cards */}
        <div className="simple-summary-strip">
          <div className="strip-item">
            <span className="strip-icon">⏳</span>
            <div>
              <strong>Payback Period (Return on Investment):</strong>
              <p>Your solar system pays for itself in approximately <strong>{calculatedResults.paybackYears} years</strong> through bill savings. Enjoy 20+ years of free electricity afterwards!</p>
            </div>
          </div>

          <div className="strip-item">
            <span className="strip-icon">🏠</span>
            <div>
              <strong>Roof Space Needed:</strong>
              <p>Requires approximately <strong>{calculatedResults.roofAreaSqFt} sq. ft</strong> of unshaded roof space with good sunlight access.</p>
            </div>
          </div>

          <div className="strip-item">
            <span className="strip-icon">🔌</span>
            <div>
              <strong>Monthly Solar Generation:</strong>
              <p>Produces ~<strong>{calculatedResults.monthlyGeneratedUnits} Units (kWh)</strong>/month (~{calculatedResults.dailyGeneratedUnits} units/day) in {selectedCity.name.split(' ')[0]}.</p>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 4: Area Vendors Rate List (Directly Below the Estimate!) */}
      <AreaVendorRateList
        selectedCity={selectedCity}
        selectedArea={selectedArea}
        onSelectArea={setSelectedArea}
        selectedPanel={selectedPanel}
        exactSystemKw={calculatedResults.systemKw}
        numberOfPanels={calculatedResults.numberOfPanels}
        selectedSystemType={selectedSystemType}
        calculatedResults={calculatedResults}
        onOpenQuoteModal={handleOpenQuoteModal}
      />

      {/* Interactive Official Free Survey & Quote Modal */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        quoteData={activeQuoteData}
      />
    </section>
  );
}