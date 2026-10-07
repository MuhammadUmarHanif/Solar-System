import React, { useState, useMemo, useEffect } from 'react';
import './SolarCalculator.css';
import {
  SOLAR_PANELS,
  SYSTEM_TYPES,
  STRUCTURE_TYPES,
  BATTERY_OPTIONS,
  INITIAL_APPLIANCES
} from '../data/solarData';
import { useSupplier } from '../context/SupplierContext';
import dbService from '../services/db';
import {
  IconZap,
  IconSun,
  IconBuilding,
  IconShield,
  IconLayers,
  IconBattery,
  IconCpu,
  IconTool,
  IconCash,
  IconClock,
  IconTrendingUp,
  IconHome,
  IconFileText,
  IconCheck,
  IconTree
} from './Icons';

export default function SolarCalculator({ supplierOverride }) {
  const supplierCtx = useSupplier();
  const effectiveSupplier = supplierOverride || supplierCtx?.activeSupplier;

  // Input Mode: 'direct_kw' (Recommended), 'bill_rs', 'bill_units', or 'appliances'
  const [inputMode, setInputMode] = useState('direct_kw');

  // Direct KW target (Default 10 kW, very popular for standard 1 Kanal / 10 Marla with ACs)
  const [targetKw, setTargetKw] = useState(10);

  // Alternative Inputs
  const [monthlyBillRs, setMonthlyBillRs] = useState(45000);
  const [monthlyUnits, setMonthlyUnits] = useState(850);
  const [appliances, setAppliances] = useState(INITIAL_APPLIANCES);

  // Dynamic Calculator Config from Supplier
  const calcConfig = useMemo(() => {
    return effectiveSupplier?.calculatorConfig || {
      derateFactor: 0.80,
      avgTariff: 48,
      installationLaborBase: 26000,
      installationLaborPerKw: 2800,
      netMeteringOngrid: 115000,
      netMeteringHybrid: 85000,
      cableProtectionBase: 38000,
      cableProtectionPerKw: 5800,
      standardStructureCostPerWatt: 5.5,
      elevatedStructureCostPerWatt: 15.0
    };
  }, [effectiveSupplier]);

  const avgTariff = calcConfig.avgTariff || 48;

  // Dynamic Supplier Products
  const availablePanels = useMemo(() => {
    if (effectiveSupplier) {
      const dbPanels = dbService.getProductsBySupplier(effectiveSupplier.id, { category: 'panels', onlyActive: true });
      if (dbPanels && dbPanels.length > 0) {
        return dbPanels.map(p => ({
          id: p.id,
          name: p.name,
          brand: p.brand || p.name.split(' ')[0],
          model: p.model || '',
          watts: p.wattage || 585,
          price: p.price,
          pricePerWatt: p.pricePerWatt || (p.wattage ? +(p.price / p.wattage).toFixed(1) : 36),
          efficiency: '22.8%',
          bifacial: p.type?.toLowerCase().includes('bifacial') ?? true,
          tag: `${p.brand || 'Tier-1'} • ${p.type || 'N-Type'}`,
          series: p.model || 'TOPCon',
          warranty: `${p.warrantyYears || 25}Y Linear`
        }));
      }
    }
    return SOLAR_PANELS;
  }, [effectiveSupplier, supplierCtx?.dataVersion]);

  const availableInverters = useMemo(() => {
    if (effectiveSupplier) {
      const dbInverters = dbService.getProductsBySupplier(effectiveSupplier.id, { category: 'inverters', onlyActive: true });
      if (dbInverters && dbInverters.length > 0) return dbInverters;
    }
    return [];
  }, [effectiveSupplier, supplierCtx?.dataVersion]);

  const availableBatteries = useMemo(() => {
    if (effectiveSupplier) {
      const dbBats = dbService.getProductsBySupplier(effectiveSupplier.id, { category: 'batteries', onlyActive: true });
      if (dbBats && dbBats.length > 0) {
        return dbBats.map(b => ({
          id: b.id,
          name: b.name,
          desc: `${b.brand || 'Lithium'} ${(b.wattage ? b.wattage / 1000 : 5)} kWh • ${b.type || 'LiFePO4'}`,
          price: b.price,
          capacityKwh: b.wattage ? (b.wattage / 1000) : 5.12
        }));
      }
    }
    return BATTERY_OPTIONS;
  }, [effectiveSupplier, supplierCtx?.dataVersion]);

  // System Configuration
  const [selectedSystemType, setSelectedSystemType] = useState('ongrid'); // 'ongrid' | 'hybrid'
  const [selectedPanel, setSelectedPanel] = useState(() => availablePanels[0] || SOLAR_PANELS[0]);
  const [selectedInverter, setSelectedInverter] = useState(null);
  const [selectedStructure, setSelectedStructure] = useState(STRUCTURE_TYPES[0]); // Standard L2/L3
  const [selectedBattery, setSelectedBattery] = useState(() => availableBatteries[0] || BATTERY_OPTIONS[1]);

  // Synchronize selections when catalog updates
  useEffect(() => {
    if (availablePanels.length > 0 && !availablePanels.find(p => p.id === selectedPanel?.id)) {
      setSelectedPanel(availablePanels[0]);
    }
  }, [availablePanels]);

  useEffect(() => {
    if (availableBatteries.length > 0 && !availableBatteries.find(b => b.id === selectedBattery?.id)) {
      setSelectedBattery(availableBatteries[0]);
    }
  }, [availableBatteries]);

  // Non-intrusive Inline Booking State
  const [isInlineBookingOpen, setIsInlineBookingOpen] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [bookingWaUrl, setBookingWaUrl] = useState('');
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    address: '',
    roofType: 'Concrete Flat Roof (Standard L2/L3)',
    notes: ''
  });

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
    const derateFactor = calcConfig.derateFactor || 0.80; // system losses
    const sunHours = 5.0; // Standard Pakistan average (5.0 - 5.5 h/day)

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
    const panelWatts = selectedPanel?.watts || 585;
    const numberOfPanels = Math.max(4, Math.ceil((requiredDcKw * 1000) / panelWatts));
    const exactSystemKw = (numberOfPanels * panelWatts) / 1000;

    // Matching Inverter (from supplier catalog if available)
    let inverterKw = 3.6;
    let inverterName = "3.6 kW Single-Phase Inverter";
    let inverterCost = 145000;
    let inverterObj = null;

    if (selectedInverter) {
      inverterCost = selectedInverter.price;
      inverterName = selectedInverter.name;
      inverterKw = (selectedInverter.wattage || 6000) / 1000;
      inverterObj = selectedInverter;
    } else if (availableInverters.length > 0) {
      // Auto-match closest inverter capacity >= exactSystemKw
      const autoMatch = availableInverters.find(i => ((i.wattage || 6000) / 1000) >= exactSystemKw) || availableInverters[availableInverters.length - 1];
      if (autoMatch) {
        inverterCost = autoMatch.price;
        inverterName = autoMatch.name;
        inverterKw = (autoMatch.wattage || 6000) / 1000;
        inverterObj = autoMatch;
      }
    } else {
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
    }

    // Bill of Materials (BOM) itemized breakdown with supplier rates
    const panelsCost = numberOfPanels * (selectedPanel?.price || 20000);
    const structureCostPerWatt = selectedStructure.id === 'elevated'
      ? (calcConfig.elevatedStructureCostPerWatt || 15.0)
      : (calcConfig.standardStructureCostPerWatt || 5.5);
    const structureCost = Math.round(exactSystemKw * 1000 * structureCostPerWatt);
    const cablesAndProtections = Math.round(
      (calcConfig.cableProtectionBase || 38000) + (exactSystemKw * (calcConfig.cableProtectionPerKw || 5800))
    );
    const netMeteringCost = selectedSystemType === 'ongrid'
      ? (calcConfig.netMeteringOngrid || 115000)
      : (calcConfig.netMeteringHybrid || 85000);
    const batteryCost = selectedSystemType === 'hybrid' ? (selectedBattery?.price || 0) : 0;
    const installationLabor = Math.round(
      (calcConfig.installationLaborBase || 26000) + (exactSystemKw * (calcConfig.installationLaborPerKw || 2800))
    );

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
    const roofAreaSqFt = Math.round(numberOfPanels * 23.5);
    const co2OffsetTonnes = (monthlyGeneratedUnits * 12 * 0.0007).toFixed(1);

    return {
      systemKw: exactSystemKw.toFixed(1),
      requiredDcKw: requiredDcKw.toFixed(1),
      numberOfPanels,
      panelModel: selectedPanel?.name || 'Selected Module',
      inverterName,
      inverterKw,
      inverterCost,
      inverterObj,
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
  }, [inputMode, targetKw, monthlyBillRs, monthlyUnits, appliances, selectedSystemType, selectedPanel, selectedInverter, selectedStructure, selectedBattery, availableInverters, calcConfig, avgTariff]);

  // Inline Booking Submission Handler (Direct on page, no screen overlay)
  const handleInlineBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookingForm.name.trim() || !bookingForm.phone.trim()) return;

    const cityCode = 'PAK';
    const ref = `PAK-${cityCode}-${Math.floor(1000 + Math.random() * 9000)}`;
    setBookingRef(ref);

    const waNum = bookingForm.whatsapp.trim() || bookingForm.phone.trim();

    const leadPayload = {
      ref,
      supplierId: effectiveSupplier?.id || 'sup_apex_solar',
      customerName: bookingForm.name.trim(),
      phone: bookingForm.phone.trim(),
      whatsappNumber: waNum,
      city: effectiveSupplier?.cityName || 'Pakistan',
      address: bookingForm.address.trim(),
      roofType: bookingForm.roofType,
      systemKw: calculatedResults.systemKw,
      numberOfPanels: calculatedResults.numberOfPanels,
      selectedPanel: selectedPanel ? {
        id: selectedPanel.id,
        name: selectedPanel.name,
        wattage: selectedPanel.wattage,
        price: selectedPanel.price
      } : null,
      selectedInverter: {
        name: calculatedResults.inverterName,
        price: calculatedResults.inverterCost
      },
      selectedBattery: calculatedResults.batteryCost > 0 ? selectedBattery : null,
      estimatedTotalCost: calculatedResults.turnkeySubtotal,
      notes: bookingForm.notes.trim()
    };

    try {
      if (supplierCtx?.submitCustomerBooking) {
        supplierCtx.submitCustomerBooking(leadPayload);
      } else {
        dbService.createLead(leadPayload);
      }
    } catch {
      dbService.createLead(leadPayload);
    }

    // Build WhatsApp direct message link
    const waText =
      `Hello ${effectiveSupplier?.name || 'Orbit Solar'},\n` +
      `I am interested in booking the solar system calculated on your portal (Ref: ${ref}).\n\n` +
      `⚡ System Size: ${calculatedResults.systemKw} kW\n` +
      `☀️ Panels: ${calculatedResults.numberOfPanels} × ${selectedPanel?.name || 'Tier-1 Module'}\n` +
      `🔌 Inverter: ${calculatedResults.inverterName || 'Solar Inverter'}\n` +
      (calculatedResults.batteryCost > 0 ? `🔋 Battery: ${selectedBattery?.name}\n` : '') +
      `💰 Est. Turnkey: PKR ${(calculatedResults.turnkeySubtotal / 100000).toFixed(2)} Lakh (Rs. ${Number(calculatedResults.turnkeySubtotal).toLocaleString()})\n` +
      `👤 Name: ${bookingForm.name.trim()}\n` +
      `📞 Phone: ${bookingForm.phone.trim()}\n` +
      (bookingForm.address ? `🏠 Address: ${bookingForm.address.trim()}\n` : '') +
      (bookingForm.notes ? `📝 Notes: ${bookingForm.notes.trim()}\n\n` : '\n') +
      `Please confirm the survey schedule and equipment availability.`;

    const cleanWa = (effectiveSupplier?.whatsapp || '923008452190').replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(waText)}`;
    setBookingWaUrl(waUrl);
    setBookingSubmitted(true);
  };

  const handleResetInlineBooking = () => {
    setBookingSubmitted(false);
    setIsInlineBookingOpen(false);
    setBookingForm({
      name: '',
      phone: '',
      whatsapp: '',
      address: '',
      roofType: 'Concrete Flat Roof (Standard L2/L3)',
      notes: ''
    });
  };

  return (
    <section id="calculator" className="calculator-section glass-panel">
      {/* Clean Minimalist Header & Company Bar */}
      <div className="calc-header-wrap">
        <div className="calc-title-group">
          <div className="calc-header-kicker-row">
            <span className="clean-kicker-pill">
              <IconZap size={13} />
              <span>Pakistan Solar Engine</span>
            </span>
            {effectiveSupplier?.pecReg && (
              <span className="supplier-active-tag">
                <IconShield size={13} />
                <span>{effectiveSupplier.pecReg}</span>
              </span>
            )}
          </div>
          <h2 className="calc-main-title">Solar Sizing & Live Turnkey Rates</h2>
          <p className="calc-subtitle">
            Accurate turnkey cost estimate, equipment breakdown, and verified turnkey installation rates by <strong>{effectiveSupplier?.name || 'Orbit Solar Technologies'}</strong>.
          </p>
        </div>

        {/* Company Name Badge in place of Location Bar */}
        <div className="location-toolbar company-header-toolbar">
          <div className="company-branding-capsule">
            <span className="company-capsule-icon-wrap">
              <IconBuilding size={15} />
            </span>
            <span className="company-capsule-name">{effectiveSupplier?.name || 'Orbit Solar Technologies'}</span>
            <span className="company-capsule-badge">
              <IconCheck size={11} />
              <span>Verified EPC</span>
            </span>
          </div>

          <div className="minimal-step-trail">
            <span className="trail-item">1. System Sizing</span>
            <span className="trail-sep">•</span>
            <span className="trail-item">2. Turnkey BOM</span>
            <span className="trail-sep">•</span>
            <span className="trail-item">3. Official Quote</span>
          </div>
        </div>
      </div>

      {/* Sleek Segmented Switcher & Quick House Presets */}
      <div className="mode-segmented-wrap">
        <div className="mode-segmented-control" role="tablist">
          <button
            type="button"
            className={`segmented-tab ${inputMode === 'direct_kw' ? 'active' : ''}`}
            onClick={() => setInputMode('direct_kw')}
          >
            <IconZap size={15} />
            <span>Select Plates & kW</span>
          </button>
          <button
            type="button"
            className={`segmented-tab ${inputMode === 'bill_rs' ? 'active' : ''}`}
            onClick={() => setInputMode('bill_rs')}
          >
            <IconCash size={15} />
            <span>Monthly Bill</span>
          </button>
          <button
            type="button"
            className={`segmented-tab ${inputMode === 'bill_units' ? 'active' : ''}`}
            onClick={() => setInputMode('bill_units')}
          >
            <IconLayers size={15} />
            <span>Monthly Units</span>
          </button>
          <button
            type="button"
            className={`segmented-tab ${inputMode === 'appliances' ? 'active' : ''}`}
            onClick={() => setInputMode('appliances')}
          >
            <IconHome size={15} />
            <span>By Appliances</span>
          </button>
        </div>

        {/* Clean House Size Chips */}
        <div className="presets-chips-row">
          <span className="preset-chip-title">Quick Presets:</span>
          <button type="button" className="preset-chip" onClick={() => applyHousePreset('5marla')}>
            5 Marla (~3.5 kW)
          </button>
          <button type="button" className="preset-chip" onClick={() => applyHousePreset('10marla')}>
            10 Marla (~7 kW)
          </button>
          <button type="button" className="preset-chip" onClick={() => applyHousePreset('1kanal')}>
            1 Kanal (~10 kW)
          </button>
          <button type="button" className="preset-chip" onClick={() => applyHousePreset('2kanal')}>
            2 Kanal (~15 kW)
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
                <button
                  type="button"
                  className="kw-adjust-btn"
                  onClick={() => setTargetKw(prev => Math.max(1, +(prev - 1).toFixed(1)))}
                  aria-label="Decrease kW"
                >
                  −
                </button>
                <div className="kw-value-center">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="50"
                    className="big-number-input"
                    value={targetKw}
                    onChange={(e) => setTargetKw(Math.max(1, parseFloat(e.target.value) || 1))}
                  />
                  <span className="currency-label">kW</span>
                </div>
                <button
                  type="button"
                  className="kw-adjust-btn"
                  onClick={() => setTargetKw(prev => +(prev + 1).toFixed(1))}
                  aria-label="Increase kW"
                >
                  +
                </button>
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
                <IconSun size={15} className="hint-svg-icon" />
                <span>A <strong>{targetKw} kW</strong> system requires approximately <strong>{calculatedResults.numberOfPanels} plates</strong> ({selectedPanel.watts}W) and produces ~<strong>{calculatedResults.monthlyGeneratedUnits} units/month</strong>.</span>
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
                <button
                  type="button"
                  className="kw-adjust-btn"
                  onClick={() => handleBillRsChange(Math.max(5000, (parseInt(monthlyBillRs, 10) || 20000) - 5000))}
                  aria-label="Decrease bill"
                >
                  −
                </button>
                <div className="kw-value-center">
                  <span className="currency-label">PKR</span>
                  <input
                    type="number"
                    step="1000"
                    min="5000"
                    max="500000"
                    className="big-number-input bill-number-input"
                    value={monthlyBillRs}
                    onChange={(e) => handleBillRsChange(e.target.value)}
                  />
                  <span className="time-badge">/mo</span>
                </div>
                <button
                  type="button"
                  className="kw-adjust-btn"
                  onClick={() => handleBillRsChange((parseInt(monthlyBillRs, 10) || 20000) + 5000)}
                  aria-label="Increase bill"
                >
                  +
                </button>
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
                <span>10k (~3kW)</span>
                <span>40k (~6kW)</span>
                <span>80k (~10kW)</span>
                <span>150k+</span>
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
                <IconSun size={15} className="hint-svg-icon" />
                <span>This bill equals approximately <strong>{monthlyUnits} Units (kWh)</strong> per month at current NEPRA tariffs.</span>
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
                <button
                  type="button"
                  className="kw-adjust-btn"
                  onClick={() => handleUnitsChange(Math.max(50, (parseInt(monthlyUnits, 10) || 300) - 50))}
                  aria-label="Decrease units"
                >
                  −
                </button>
                <div className="kw-value-center">
                  <input
                    type="number"
                    step="25"
                    min="50"
                    max="5000"
                    className="big-number-input units-number-input"
                    value={monthlyUnits}
                    onChange={(e) => handleUnitsChange(e.target.value)}
                  />
                  <span className="unit-label-badge">
                    Units/mo
                  </span>
                </div>
                <button
                  type="button"
                  className="kw-adjust-btn"
                  onClick={() => handleUnitsChange((parseInt(monthlyUnits, 10) || 300) + 50)}
                  aria-label="Increase units"
                >
                  +
                </button>
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
                <span>200 U</span>
                <span>600 U (~5kW)</span>
                <span>1200 U (~10kW)</span>
                <span>3000+ U</span>
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
                <IconSun size={15} className="hint-svg-icon" />
                <span>Consuming {monthlyUnits} units costs approximately <strong>PKR {monthlyBillRs.toLocaleString()}</strong> every month.</span>
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

          {/* Live System Yield & Load Capability Box (Fills space with high-value real-time data) */}
          <div className="system-live-insights-card">
            <div className="insights-card-header">
              <div className="insights-title-row">
                <span className="insights-dot" />
                <h4 className="insights-title">{calculatedResults.systemKw} kW System Live Output</h4>
              </div>
              <span className="insights-badge">National Benchmark</span>
            </div>

            {/* 4 Mini Stat Tiles */}
            <div className="insights-stats-grid">
              <div className="insight-stat-tile">
                <span className="stat-icon"><IconZap size={16} /></span>
                <div className="stat-info">
                  <span className="stat-label">Daily Generation</span>
                  <strong className="stat-val num-tabular">~{calculatedResults.dailyGeneratedUnits} <span className="stat-unit">Units/day</span></strong>
                </div>
              </div>

              <div className="insight-stat-tile">
                <span className="stat-icon"><IconTrendingUp size={16} /></span>
                <div className="stat-info">
                  <span className="stat-label">Monthly Generation</span>
                  <strong className="stat-val num-tabular">~{calculatedResults.monthlyGeneratedUnits} <span className="stat-unit">Units/mo</span></strong>
                </div>
              </div>

              <div className="insight-stat-tile highlight-green">
                <span className="stat-icon"><IconCash size={16} /></span>
                <div className="stat-info">
                  <span className="stat-label">Monthly Bill Offset</span>
                  <strong className="stat-val text-mint num-tabular">Rs. {calculatedResults.monthlySavings.toLocaleString()}</strong>
                </div>
              </div>

              <div className="insight-stat-tile">
                <span className="stat-icon"><IconHome size={16} /></span>
                <div className="stat-info">
                  <span className="stat-label">Required Roof Area</span>
                  <strong className="stat-val num-tabular">~{calculatedResults.roofAreaSqFt} <span className="stat-unit">sq. ft</span></strong>
                </div>
              </div>
            </div>

            {/* Real-World Appliance Load Capability Preview */}
            <div className="load-capability-section">
              <div className="load-section-header">
                <span className="load-section-title"><IconZap size={15} style={{ verticalAlign: 'middle', marginRight: '6px' }} />What Can This {calculatedResults.systemKw} kW System Run?</span>
                <span className="load-simultaneous-tag">Simultaneous Daytime Load</span>
              </div>
              <div className="load-appliances-pills">
                {parseFloat(calculatedResults.systemKw) >= 15 ? (
                  <>
                    <span className="load-pill">❄️ 3-4 Inverter ACs (1.5 Ton)</span>
                    <span className="load-pill">💧 2x Water Pumps (2 HP)</span>
                    <span className="load-pill">🧊 2-3 Refrigerators & Freezers</span>
                    <span className="load-pill">💡 Full Commercial / Large Villa Lighting</span>
                    <span className="load-pill highlight-load">⚡ Heavy Duty Appliances</span>
                  </>
                ) : parseFloat(calculatedResults.systemKw) >= 10 ? (
                  <>
                    <span className="load-pill">❄️ 2x Inverter ACs (1.5 Ton)</span>
                    <span className="load-pill">💧 1x 1.5 HP Water Pump</span>
                    <span className="load-pill">🧊 2x Refrigerators / Deep Freezers</span>
                    <span className="load-pill">💡 All House Fans & LED Lights</span>
                    <span className="load-pill">⚡ Microwave & Washing Machine</span>
                  </>
                ) : parseFloat(calculatedResults.systemKw) >= 7 ? (
                  <>
                    <span className="load-pill">❄️ 1-2 Inverter ACs (1.5 Ton)</span>
                    <span className="load-pill">💧 1x 1 HP Water Pump</span>
                    <span className="load-pill">🧊 1-2 Refrigerators</span>
                    <span className="load-pill">💡 8-10 Fans & All Lights</span>
                    <span className="load-pill">📺 LED TVs & Computers</span>
                  </>
                ) : parseFloat(calculatedResults.systemKw) >= 5 ? (
                  <>
                    <span className="load-pill">❄️ 1x Inverter AC (1.5 Ton)</span>
                    <span className="load-pill">🧊 1x Refrigerator</span>
                    <span className="load-pill">💧 1x 1 HP Water Pump (Daytime)</span>
                    <span className="load-pill">💡 6 Fans, LEDs & LED TV</span>
                  </>
                ) : (
                  <>
                    <span className="load-pill">❄️ 1x 1-Ton Inverter AC or Room Cooler</span>
                    <span className="load-pill">🧊 1x Inverter Refrigerator</span>
                    <span className="load-pill">💡 4-5 Ceiling Fans & All LEDs</span>
                    <span className="load-pill">📱 TV, Laptops & Mobile Charging</span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Efficiency & Return Highlights */}
            <div className="insights-footer-strip">
              <div className="strip-metric">
                <span className="metric-icon"><IconClock size={15} /></span>
                <span>Payback: <strong className="num-tabular">~{calculatedResults.paybackYears} Yrs</strong></span>
              </div>
              <div className="strip-metric">
                <span className="metric-icon"><IconTree size={15} /></span>
                <span>CO₂ Saved: <strong className="num-tabular">~{calculatedResults.co2OffsetTonnes} T/yr</strong></span>
              </div>
              <div className="strip-metric">
                <span className="metric-icon"><IconCpu size={15} /></span>
                <span>Inverter: <strong>{calculatedResults.inverterKw} kW Tier-1</strong></span>
              </div>
            </div>
          </div>
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
                <IconLayers size={16} />
                <span>Select Solar Plates Brand & Wattage:</span>
              </label>
              <div className="panel-choices-list">
                {availablePanels.map(p => (
                  <div
                    key={p.id}
                    className={`panel-choice-item ${selectedPanel.id === p.id ? 'is-selected' : ''}`}
                    onClick={() => setSelectedPanel(p)}
                  >
                    <div className="panel-radio-indicator">
                      <div className={`radio-dot ${selectedPanel.id === p.id ? 'is-active' : ''}`} />
                    </div>
                    <div className="panel-text-block">
                      <div className="panel-name-row">
                        <span className="panel-name-txt">{p.name}</span>
                        {p.bifacial && <span className="bifacial-tag">Bifacial</span>}
                      </div>
                      <div className="panel-compact-meta">
                        <span className="panel-tag-compact">{p.tag ? p.tag.split('•')[0].trim() : (p.brand || 'Tier-1')}</span>
                        <span className="dot-sep">•</span>
                        <span className="panel-eff-badge">{p.efficiency || '22.8%'}</span>
                        <span className="dot-sep">•</span>
                        <span className="panel-warranty-compact">{p.warranty ? p.warranty.split('/')[0].trim() : '25Y'}</span>
                      </div>
                    </div>
                    <div className="panel-rate-block">
                      <span className="panel-price-tag">Rs. {Number(p.price).toLocaleString()}</span>
                      <span className="per-plate-sub">Rs. {p.pricePerWatt}/W</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inverter Brand & Model Selection (Dynamic from Supplier Catalog) */}
            {availableInverters.length > 0 && (
              <div className="simple-field-group">
                <label className="field-label-bold">
                  <IconCpu size={16} />
                  <span>Select Inverter Brand & Model:</span>
                </label>
                <div className="inverter-choices-grid">
                  {availableInverters.map(inv => {
                    const invKw = (inv.wattage || 6000) / 1000;
                    const isSelected = selectedInverter ? selectedInverter.id === inv.id : (calculatedResults.inverterObj?.id === inv.id);
                    return (
                      <div
                        key={inv.id}
                        className={`inverter-choice-card ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => setSelectedInverter(inv)}
                      >
                        <div className="inv-card-top">
                          <span className="inv-brand-badge">{inv.brand || 'Tier-1'}</span>
                          <span className="inv-kw-pill num-tabular">{invKw} kW</span>
                        </div>
                        <div className="inv-card-name">{inv.name}</div>
                        <div className="inv-card-bottom">
                          <div className="inv-price-info">
                            <span className="inv-price-tag num-tabular">Rs. {Number(inv.price).toLocaleString()}</span>
                          </div>
                          <div className={`inv-radio-indicator ${isSelected ? 'is-active' : ''}`}>
                            <div className="inv-radio-dot" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* System Type Selection */}
            <div className="simple-field-group">
              <label className="field-label-bold">
                <IconZap size={16} />
                <span>System Type (On-Grid vs Loadshedding Backup?):</span>
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
                  <IconBattery size={16} />
                  <span>Choose Battery Storage Bank:</span>
                </label>
                <div className="battery-options-list">
                  {availableBatteries.filter(b => b.id !== 'none').map(b => (
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
                <IconTool size={16} />
                <span>Roof Mounting Structure:</span>
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
              Live calculated using real-time verified equipment and installation rates:
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
            <span className="card-top-icon-badge"><IconZap size={20} /></span>
            <span className="answer-card-label">Recommended System Size</span>
            <div className="big-highlight-number num-tabular">
              {calculatedResults.systemKw} <span className="unit-small">kW</span>
            </div>
            <p className="answer-sub-explainer">
              Inverter: <strong>{calculatedResults.inverterName}</strong>
            </p>
          </div>

          {/* Card 2: Number of Panels */}
          <div className="answer-card">
            <span className="card-top-icon-badge"><IconLayers size={20} /></span>
            <span className="answer-card-label">Total Solar Plates Needed</span>
            <div className="big-highlight-number num-tabular">
              {calculatedResults.numberOfPanels} <span className="unit-small">Plates</span>
            </div>
            <p className="answer-sub-explainer">
              {selectedPanel.watts}W {selectedPanel.brand} ({selectedPanel.series})
            </p>
          </div>

          {/* Card 3: Total Estimated Turnkey Cost */}
          <div className="answer-card">
            <span className="card-top-icon-badge"><IconCash size={20} /></span>
            <span className="answer-card-label">Total Turnkey Cost</span>
            <div className="big-highlight-number turnkey-cost-number num-tabular">
              PKR {(calculatedResults.totalEstimatedCostMin / 100000).toFixed(2)} - {(calculatedResults.totalEstimatedCostMax / 100000).toFixed(2)} Lakh
            </div>
            <p className="answer-sub-explainer">
              (Includes Panels, Inverter, Stand, Copper Cables, Breakers & Net Metering)
            </p>
          </div>

          {/* Card 4: Monthly Bill Savings */}
          <div className="answer-card green-highlight-card">
            <span className="card-top-icon-badge"><IconTrendingUp size={20} /></span>
            <span className="answer-card-label">Estimated Monthly Bill Savings</span>
            <div className="big-highlight-number text-mint num-tabular">
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
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconFileText size={18} />
                <span>Complete Turnkey Itemized Cost Breakdown (Estimated)</span>
              </h4>
              <span className="bom-sub">Transparent hardware & installation costs:</span>
            </div>
            <span className="bom-swipe-hint">👈 Swipe to scroll 👉</span>
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
                  <td colSpan="3">
                    <div className="bom-total-label-wrap">
                      <IconShield size={16} style={{ color: '#00d2ff', flexShrink: 0 }} />
                      <div>
                        <strong>Total Turnkey Project Estimate</strong>
                        <span className="bom-total-note">Hardware, engineering, net metering & turnkey labor included</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="bom-total-cost num-tabular">PKR {(calculatedResults.turnkeySubtotal / 100000).toFixed(2)} Lakh</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Seamless In-Page Booking / Survey Request Panel (No full-screen blocking popup) */}
          {!isInlineBookingOpen ? (
            <div className="calc-booking-cta-banner">
              <div className="cta-banner-text">
                <span className="cta-disclaimer-pill">
                  <IconShield size={12} />
                  <span>Official Estimate • Final invoice verified after physical survey</span>
                </span>
                <h3>Book / Request This {calculatedResults.systemKw} kW System</h3>
                <p>
                  Lock in verified turnkey equipment and installation rates with <strong>{effectiveSupplier?.name || 'Orbit Solar Technologies'}</strong>.
                </p>
              </div>
              <button
                type="button"
                className="btn-book-this-system"
                onClick={() => setIsInlineBookingOpen(true)}
              >
                <IconZap size={18} />
                <span>Book / Request This System Now</span>
              </button>
            </div>
          ) : (
            <div className="calc-booking-inline-card" id="inline-booking-box">
              {bookingSubmitted ? (
                <div className="inline-booking-success-view">
                  <div className="inline-success-badge-icon">
                    <IconCheck size={26} />
                  </div>
                  <h3>Booking & Survey Request Confirmed!</h3>
                  <div className="inline-ref-chip">
                    <span>Reference ID:</span>
                    <strong>{bookingRef}</strong>
                    <span>•</span>
                    <strong>{calculatedResults.systemKw} kW System</strong>
                  </div>
                  <p className="inline-success-text">
                    Your request has been logged directly with <strong>{effectiveSupplier?.name || 'Orbit Solar Technologies'}</strong>. Our engineering team will review your specifications and call you at <strong>{bookingForm.phone}</strong> to confirm the roof survey appointment.
                  </p>
                  <div className="inline-success-buttons">
                    {bookingWaUrl && (
                      <a
                        href={bookingWaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-inline-wa-chat"
                      >
                        <IconZap size={16} />
                        <span>Open WhatsApp with System Specifications</span>
                      </a>
                    )}
                    <button
                      type="button"
                      className="btn-inline-done-btn"
                      onClick={handleResetInlineBooking}
                    >
                      Done / Close Form
                    </button>
                  </div>
                </div>
              ) : (
                <div className="inline-booking-form-wrap">
                  <div className="inline-form-topbar">
                    <div className="topbar-left">
                      <span className="inline-kicker-tag">
                        <IconZap size={12} />
                        <span>Direct Booking & Survey Request</span>
                      </span>
                      <h4>Book {calculatedResults.systemKw} kW System with {effectiveSupplier?.name || 'Orbit Solar Technologies'}</h4>
                      <p className="topbar-sub">
                        Est. Turnkey: <strong style={{ color: '#00d2ff' }}>PKR {(calculatedResults.turnkeySubtotal / 100000).toFixed(2)} Lakh</strong> • <strong>{calculatedResults.numberOfPanels} Panels</strong> • Net Metering Included
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn-inline-close"
                      onClick={() => setIsInlineBookingOpen(false)}
                      title="Cancel & close form"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleInlineBookingSubmit} className="inline-actual-form">
                    <div className="inline-inputs-row">
                      <div className="inline-field-group">
                        <label htmlFor="in-name">Full Name *</label>
                        <input
                          id="in-name"
                          type="text"
                          required
                          placeholder="e.g. Muhammad Ali"
                          value={bookingForm.name}
                          onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                        />
                      </div>

                      <div className="inline-field-group">
                        <label htmlFor="in-phone">Contact Phone Number *</label>
                        <input
                          id="in-phone"
                          type="tel"
                          required
                          placeholder="e.g. 0300 1234567"
                          value={bookingForm.phone}
                          onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                        />
                      </div>

                      <div className="inline-field-group">
                        <label htmlFor="in-wa">WhatsApp (If different)</label>
                        <input
                          id="in-wa"
                          type="tel"
                          placeholder="e.g. 0300 1234567"
                          value={bookingForm.whatsapp}
                          onChange={(e) => setBookingForm({ ...bookingForm, whatsapp: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="inline-inputs-row">
                      <div className="inline-field-group inline-flex-2">
                        <label htmlFor="in-address">House / Roof Address</label>
                        <input
                          id="in-address"
                          type="text"
                          placeholder="e.g. House 42, Block B, DHA, Lahore"
                          value={bookingForm.address}
                          onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                        />
                      </div>

                      <div className="inline-field-group inline-flex-1">
                        <label htmlFor="in-roof">Roof Structure Type</label>
                        <select
                          id="in-roof"
                          value={bookingForm.roofType}
                          onChange={(e) => setBookingForm({ ...bookingForm, roofType: e.target.value })}
                        >
                          <option value="Concrete Flat Roof (Standard L2/L3)">Concrete Flat Roof (Standard L2/L3)</option>
                          <option value="Elevated Walkable Steel Structure">Elevated Walkable Steel Structure</option>
                          <option value="Tin / Corrugated Shed">Tin / Corrugated Shed</option>
                          <option value="Open Ground / Lawn">Open Ground / Lawn</option>
                        </select>
                      </div>
                    </div>

                    <div className="inline-inputs-row">
                      <div className="inline-field-group inline-flex-full">
                        <label htmlFor="in-notes">Special Requirements / Notes (Optional)</label>
                        <input
                          id="in-notes"
                          type="text"
                          placeholder="e.g. Preferred inverter brand, net metering timeline..."
                          value={bookingForm.notes}
                          onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="inline-form-actions-bar">
                      <button type="submit" className="btn-confirm-inline-booking">
                        <IconZap size={16} />
                        <span>Confirm Booking & Request Official Survey</span>
                      </button>
                      <button
                        type="button"
                        className="btn-cancel-inline-booking"
                        onClick={() => setIsInlineBookingOpen(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3 Detail Metric Cards */}
        <div className="simple-summary-strip">
          <div className="strip-item">
            <span className="strip-icon-wrap"><IconClock size={20} /></span>
            <div>
              <strong>Payback Period (Return on Investment):</strong>
              <p>Your solar system pays for itself in approximately <strong>{calculatedResults.paybackYears} years</strong> through bill savings. Enjoy 20+ years of free electricity afterwards!</p>
            </div>
          </div>

          <div className="strip-item">
            <span className="strip-icon-wrap"><IconHome size={20} /></span>
            <div>
              <strong>Roof Space Needed:</strong>
              <p>Requires approximately <strong>{calculatedResults.roofAreaSqFt} sq. ft</strong> of unshaded roof space with good sunlight access.</p>
            </div>
          </div>

          <div className="strip-item">
            <span className="strip-icon-wrap"><IconSun size={20} /></span>
            <div>
              <strong>Monthly Solar Generation:</strong>
              <p>Produces ~<strong>{calculatedResults.monthlyGeneratedUnits} Units (kWh)</strong>/month (~{calculatedResults.dailyGeneratedUnits} units/day).</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}