import React, { useState, useMemo } from 'react';
import './SolarCalculator.css';

const SolarCalculator = () => {
  // Input Mode: 'bill_rs' (Bill in Rupees), 'bill_units' (Bill in Units), or 'appliances' (List of fans/ACs)
  const [inputMode, setInputMode] = useState('bill_rs');
  
  // Primary Inputs
  const [monthlyBillRs, setMonthlyBillRs] = useState(32000); // PKR 32,000 / month
  const [monthlyUnits, setMonthlyUnits] = useState(650); // 650 kWh
  
  // Average NEPRA tariff in Pakistan (including taxes, fuel price adjustment - FPA, surcharges)
  const avgTariff = 48; // PKR per unit

  // Major Pakistani Cities / Regions (with actual peak sun irradiance hours)
  const cities = [
    { id: 'lahore', name: "Lahore & Central Punjab (LESCO / GEPCO)", sunHours: 4.8 },
    { id: 'islamabad', name: "Islamabad & Rawalpindi (IESCO)", sunHours: 5.0 },
    { id: 'karachi', name: "Karachi & Sindh (K-Electric / HESCO)", sunHours: 5.5 },
    { id: 'multan', name: "Multan & South Punjab (MEPCO)", sunHours: 5.4 },
    { id: 'faisalabad', name: "Faisalabad (FESCO)", sunHours: 4.9 },
    { id: 'peshawar', name: "Peshawar & KPK (PESCO)", sunHours: 4.8 },
    { id: 'quetta', name: "Quetta & Balochistan (QESCO)", sunHours: 6.2 },
  ];
  const [selectedCity, setSelectedCity] = useState(cities[0]);

  // System Types explained in simple plain English
  const systemOptions = [
    {
      id: 'ongrid',
      title: "On-Grid (Net Metering)",
      badge: "Zero Bill System",
      subNote: "Sell excess solar units back to WAPDA/K-Electric",
      desc: "Best for eliminating electricity bills. Uses solar directly during the day and exports extra power to the grid. Fastest payback period.",
      recommended: true
    },
    {
      id: 'hybrid',
      title: "Hybrid (Battery Backup)",
      badge: "Loadshedding Protected",
      subNote: "Runs even during power outages and blackouts",
      desc: "Includes battery storage. Powers your essential fans, lights, and fridge when the main grid goes down.",
      recommended: false
    }
  ];
  const [selectedSystemType, setSelectedSystemType] = useState('ongrid');

  // Solar Panels - Current Verified Tier-1 Pakistan Market
  const panels = [
    {
      id: '550w',
      name: "550W Tier-1 Mono PERC (Longi / JA Solar)",
      tag: "Most popular & reliable choice in Pakistan",
      watts: 550,
      price: 18500
    },
    {
      id: '585w',
      name: "585W N-Type TOPCon (Jinko Tiger Neo)",
      tag: "Latest high efficiency (maximum generation)",
      watts: 585,
      price: 20500
    },
    {
      id: '600w',
      name: "600W Bifacial Dual-Glass (Canadian / Trina)",
      tag: "Dual-sided generation for higher output",
      watts: 600,
      price: 22500
    }
  ];
  const [selectedPanel, setSelectedPanel] = useState(panels[1]); // Default 585W TOPCon

  // Everyday Appliances with realistic running hours
  const initialAppliances = [
    { id: 1, name: "1.5 Ton Inverter AC", subtext: "Master Bedroom AC", watts: 1400, hours: 8, quantity: 1, icon: "❄️" },
    { id: 2, name: "1.0 Ton Inverter AC", subtext: "Small Room AC", watts: 1000, hours: 8, quantity: 0, icon: "❄️" },
    { id: 3, name: "Ceiling Fans", subtext: "Standard / Inverter Fans", watts: 65, hours: 14, quantity: 4, icon: "🌀" },
    { id: 4, name: "Refrigerator / Fridge", subtext: "Inverter Compressor", watts: 160, hours: 12, quantity: 1, icon: "🧊" },
    { id: 5, name: "Water Pump (Motor)", subtext: "1.0 HP Water Motor", watts: 750, hours: 1.5, quantity: 1, icon: "💧" },
    { id: 6, name: "Washing Machine", subtext: "Automatic / Spinner", watts: 450, hours: 1, quantity: 1, icon: "🧺" },
    { id: 7, name: "LED Lights / Bulbs", subtext: "Home Lighting", watts: 12, hours: 6, quantity: 12, icon: "💡" },
    { id: 8, name: "Electric Iron", subtext: "Dry & Steam Iron", watts: 1000, hours: 0.5, quantity: 1, icon: "👔" },
    { id: 9, name: "LED TV & Smart Box", subtext: "Television", watts: 85, hours: 6, quantity: 1, icon: "📺" },
    { id: 10, name: "WiFi Router & CCTV", subtext: "Internet & Security", watts: 30, hours: 24, quantity: 1, icon: "📡" },
    { id: 11, name: "Deep Freezer", subtext: "Deep Freezer Unit", watts: 240, hours: 8, quantity: 0, icon: "❄️" },
    { id: 12, name: "Computer / Laptop", subtext: "PC Workstation", watts: 120, hours: 6, quantity: 1, icon: "💻" },
  ];
  const [appliances, setAppliances] = useState(initialAppliances);

  // Update appliance count
  const updateQuantity = (id, delta) => {
    setAppliances(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
    ));
  };

  // Quick Preset Handlers (Super easy for anyone)
  const applyHousePreset = (preset) => {
    if (preset === '5marla') {
      setInputMode('bill_rs');
      setMonthlyBillRs(22000);
      setMonthlyUnits(450);
    } else if (preset === '10marla') {
      setInputMode('bill_rs');
      setMonthlyBillRs(45000);
      setMonthlyUnits(850);
    } else if (preset === '1kanal') {
      setInputMode('bill_rs');
      setMonthlyBillRs(95000);
      setMonthlyUnits(1800);
    }
  };

  // Auto-sync between bill Rs and Units when changed
  const handleBillRsChange = (val) => {
    const num = Math.max(0, parseInt(val) || 0);
    setMonthlyBillRs(num);
    setMonthlyUnits(Math.round(num / avgTariff));
  };

  const handleUnitsChange = (val) => {
    const num = Math.max(0, parseInt(val) || 0);
    setMonthlyUnits(num);
    setMonthlyBillRs(num * avgTariff);
  };

  // Live Auto Calculation (Recalculates instantly when any parameter changes)
  const calculatedResults = useMemo(() => {
    let dailyKwhNeeded = 0;

    if (inputMode === 'bill_rs') {
      const units = monthlyBillRs / avgTariff;
      dailyKwhNeeded = units / 30;
    } else if (inputMode === 'bill_units') {
      dailyKwhNeeded = monthlyUnits / 30;
    } else {
      // By appliance inventory
      let totalDailyWattHours = 0;
      appliances.forEach(a => {
        totalDailyWattHours += a.watts * a.quantity * a.hours;
      });
      dailyKwhNeeded = totalDailyWattHours / 1000;
    }

    if (dailyKwhNeeded <= 0) dailyKwhNeeded = 5; // fallback minimum

    // 100% Engineering Derate & Peak Sun Hours
    const derateFactor = 0.80; // 20% standard losses (temperature, dust, inverter & DC drop)
    const sunHours = selectedCity.sunHours;
    
    // Required DC Solar kW
    const requiredDcKw = (dailyKwhNeeded / sunHours) / derateFactor;

    // Number of Panels
    const panelWatts = selectedPanel.watts;
    const numberOfPanels = Math.max(4, Math.ceil((requiredDcKw * 1000) / panelWatts));
    const exactSystemKw = (numberOfPanels * panelWatts) / 1000;

    // Inverter Capacity in Pakistan Standards
    let inverterKw = 3.2;
    let inverterName = "3.2 kW On-Grid / Hybrid";
    if (exactSystemKw > 14) {
      inverterKw = 20;
      inverterName = "20 kW Three-Phase Inverter";
    } else if (exactSystemKw > 10.5) {
      inverterKw = 15;
      inverterName = "15 kW Three-Phase Inverter";
    } else if (exactSystemKw > 7.5) {
      inverterKw = 10;
      inverterName = "10 kW Three-Phase Inverter";
    } else if (exactSystemKw > 5.2) {
      inverterKw = 8;
      inverterName = "8 kW Three-Phase Inverter";
    } else if (exactSystemKw > 3.4) {
      inverterKw = 6;
      inverterName = "6 kW Three-Phase Inverter";
    } else {
      inverterKw = 3.6;
      inverterName = "3.6 kW Single-Phase Inverter";
    }

    // Monthly units generated by solar
    const monthlyGeneratedUnits = Math.round(exactSystemKw * sunHours * 30 * derateFactor);

    // Monthly bill savings (PKR)
    const monthlySavings = Math.round(monthlyGeneratedUnits * avgTariff);
    const yearlySavings = monthlySavings * 12;

    // Turnkey Project Cost in Pakistan (Panels + Inverter + Customized Heavy Gauge GI Stand + AC/DC Wires, Breakers, Earthing, Net Metering Green Meter Processing)
    const pricePerKw = selectedSystemType === 'hybrid' ? 142000 : 120000;
    const totalEstimatedCostMin = Math.round(exactSystemKw * (pricePerKw - 6000));
    const totalEstimatedCostMax = Math.round(exactSystemKw * (pricePerKw + 6000));

    // Panels alone cost
    const panelsOnlyCost = numberOfPanels * selectedPanel.price;

    // Payback period
    const paybackYears = (totalEstimatedCostMin / yearlySavings).toFixed(1);

    // Roof space required (22-23 sq ft per modern 550W+ module with walking clearance)
    const roofAreaSqFt = Math.round(numberOfPanels * 23);

    return {
      systemKw: exactSystemKw.toFixed(1),
      numberOfPanels,
      panelModel: selectedPanel.name,
      inverterName,
      inverterKw,
      monthlyGeneratedUnits,
      monthlySavings,
      yearlySavings,
      totalEstimatedCostMin,
      totalEstimatedCostMax,
      panelsOnlyCost,
      paybackYears,
      roofAreaSqFt
    };
  }, [inputMode, monthlyBillRs, monthlyUnits, appliances, selectedCity, selectedSystemType, selectedPanel]);

  return (
    <section id="calculator" className="calculator-section glass-panel">
      {/* Friendly Header in Easy English */}
      <div className="section-header">
        <span className="section-pill">⚡ Easy Solar Calculator</span>
        <h2>Calculate Your Solar System</h2>
        <p className="section-subtitle">
          Simple and accurate solar calculator. Enter your monthly electricity bill or select your home appliances to instantly find out how many solar panels you need, total cost, and monthly savings.
        </p>
      </div>

      {/* 3 Simple Ways to Input */}
      <div className="input-mode-tabs-container">
        <div className="input-mode-tabs">
          <button
            type="button"
            className={`mode-tab-btn ${inputMode === 'bill_rs' ? 'is-active' : ''}`}
            onClick={() => setInputMode('bill_rs')}
          >
            <span className="tab-icon">💳</span>
            <div className="tab-text">
              <strong>Monthly Bill (in Rupees)</strong>
              <span>e.g. Rs. 30,000 / month</span>
            </div>
          </button>

          <button
            type="button"
            className={`mode-tab-btn ${inputMode === 'bill_units' ? 'is-active' : ''}`}
            onClick={() => setInputMode('bill_units')}
          >
            <span className="tab-icon">⚡</span>
            <div className="tab-text">
              <strong>Electricity Units (kWh)</strong>
              <span>e.g. 500 or 700 Units</span>
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
              <span>Select Fans, ACs, Fridge, etc.</span>
            </div>
          </button>
        </div>

        {/* Quick House Size Presets */}
        <div className="house-presets-bar">
          <span className="presets-label">Quick house size shortcuts:</span>
          <button type="button" className="house-preset-btn" onClick={() => applyHousePreset('5marla')}>
            🏠 5 Marla (Small Home ~3 kW)
          </button>
          <button type="button" className="house-preset-btn" onClick={() => applyHousePreset('10marla')}>
            🏡 10 Marla (Medium Home ~6 kW)
          </button>
          <button type="button" className="house-preset-btn" onClick={() => applyHousePreset('1kanal')}>
            🏰 1 Kanal (Large Home ~10 kW)
          </button>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="calculator-grid">
        {/* Left Column: Easy Inputs */}
        <div className="column-card input-column">
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

              {/* Slider */}
              <input
                type="range"
                min="8000"
                max="150000"
                step="2000"
                className="clean-slider"
                value={monthlyBillRs}
                onChange={(e) => handleBillRsChange(e.target.value)}
              />

              <div className="slider-hints-row">
                <span>Rs. 10,000 (Small)</span>
                <span>Rs. 40,000 (5kW)</span>
                <span>Rs. 80,000 (10kW)</span>
                <span>Rs. 150,000+</span>
              </div>

              {/* Quick Select Buttons */}
              <div className="quick-amount-pills">
                {[15000, 25000, 35000, 50000, 75000, 100000].map(amt => (
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
                💡 This bill equals approximately <strong>{monthlyUnits} Units (kWh)</strong> per month.
              </div>
            </div>
          )}

          {inputMode === 'bill_units' && (
            <div className="input-block-card">
              <div className="card-top-title">
                <h3>How many electricity units do you use monthly?</h3>
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

              {/* Slider */}
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
                <span>600 Units (5kW)</span>
                <span>1200 Units (10kW)</span>
                <span>3000+ Units</span>
              </div>

              {/* Quick Select Buttons */}
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
                💡 This equals approximately <strong>PKR {monthlyBillRs.toLocaleString()}</strong> in bill charges.
              </div>
            </div>
          )}

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

        {/* Right Column: Simple Preferences */}
        <div className="column-card config-column">
          <div className="card-top-title">
            <h3>System Preferences</h3>
            <span className="helper-badge">Easy Settings</span>
          </div>

          <div className="config-fields-simple">
            {/* City Selection */}
            <div className="simple-field-group">
              <label className="field-label-bold">
                📍 1. Select Your City / Location:
              </label>
              <select
                className="friendly-select"
                value={selectedCity.id}
                onChange={(e) => {
                  const found = cities.find(c => c.id === e.target.value);
                  if (found) setSelectedCity(found);
                }}
              >
                {cities.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <span className="field-micro-note">
                Calculates exact panel generation based on regional sunlight hours.
              </span>
            </div>

            {/* System Type (On-Grid vs Hybrid) */}
            <div className="simple-field-group">
              <label className="field-label-bold">
                ⚡ 2. System Type (On-Grid or Battery Backup?):
              </label>
              <div className="system-choice-cards">
                {systemOptions.map(sys => (
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

            {/* Solar Plate Type */}
            <div className="simple-field-group">
              <label className="field-label-bold">
                🔲 3. Choose Solar Panel Brand:
              </label>
              <div className="panel-choices-list">
                {panels.map(p => (
                  <div
                    key={p.id}
                    className={`panel-choice-item ${selectedPanel.id === p.id ? 'is-selected' : ''}`}
                    onClick={() => setSelectedPanel(p)}
                  >
                    <div className="panel-text-block">
                      <span className="panel-name-txt">{p.name}</span>
                      <span className="panel-tag-txt">{p.tag}</span>
                    </div>
                    <div className="panel-rate-block">
                      <span className="panel-price-tag">Rs. {p.price.toLocaleString()}</span>
                      <span className="per-plate-sub">per panel</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crystal Clear Live Results Section (Always Visible & Live Updating) */}
      <div className="live-results-panel">
        <div className="results-banner-header">
          <div>
            <h3>Your Complete Solar System Recommendation</h3>
            <p className="results-subtitle-txt">
              Live calculated results based on verified Pakistani market rates and solar irradiance:
            </p>
          </div>
          <div className="live-active-indicator">
            <span className="pulsing-green-dot"></span>
            <span>Live Calculation</span>
          </div>
        </div>

        {/* 4 Big Main Result Cards (What matters to every homeowner) */}
        <div className="main-answers-grid">
          {/* Card 1: System Size */}
          <div className="answer-card glow-card">
            <span className="card-top-icon">⚡</span>
            <span className="answer-card-label">Recommended System Size</span>
            <div className="big-highlight-number">
              {calculatedResults.systemKw} <span className="unit-small">kW</span>
            </div>
            <p className="answer-sub-explainer">
              Matching Inverter: <strong>{calculatedResults.inverterName}</strong>
            </p>
          </div>

          {/* Card 2: Number of Panels */}
          <div className="answer-card">
            <span className="card-top-icon">🔲</span>
            <span className="answer-card-label">Total Solar Panels Needed</span>
            <div className="big-highlight-number">
              {calculatedResults.numberOfPanels} <span className="unit-small">Panels</span>
            </div>
            <p className="answer-sub-explainer">
              {selectedPanel.watts}W Tier-1 Modules
            </p>
          </div>

          {/* Card 3: Total Estimated Cost */}
          <div className="answer-card">
            <span className="card-top-icon">💰</span>
            <span className="answer-card-label">Total Estimated Cost</span>
            <div className="big-highlight-number" style={{ fontSize: '1.65rem' }}>
              PKR {(calculatedResults.totalEstimatedCostMin / 100000).toFixed(2)} - {(calculatedResults.totalEstimatedCostMax / 100000).toFixed(2)} Lakh
            </div>
            <p className="answer-sub-explainer">
              (Complete Turnkey Setup: Panels, Inverter, Stand, Wiring & Net Metering)
            </p>
          </div>

          {/* Card 4: Monthly Bill Savings */}
          <div className="answer-card green-highlight-card">
            <span className="card-top-icon">💵</span>
            <span className="answer-card-label">Estimated Monthly Savings</span>
            <div className="big-highlight-number text-mint">
              PKR {calculatedResults.monthlySavings.toLocaleString()} <span className="unit-small">/ mo</span>
            </div>
            <p className="answer-sub-explainer">
              Annual Savings: <strong>PKR {calculatedResults.yearlySavings.toLocaleString()}</strong>
            </p>
          </div>
        </div>

        {/* 3 Detail Info Cards */}
        <div className="simple-summary-strip">
          <div className="strip-item">
            <span className="strip-icon">⏳</span>
            <div>
              <strong>Payback Period (Return on Investment):</strong>
              <p>Your solar system pays for itself in approximately <strong>{calculatedResults.paybackYears} years</strong> through bill savings. After that, enjoy 20+ years of free electricity!</p>
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
              <strong>Monthly Solar Electricity Generation:</strong>
              <p>This system produces approximately <strong>{calculatedResults.monthlyGeneratedUnits} Units (kWh)</strong> of clean electricity every month.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolarCalculator;