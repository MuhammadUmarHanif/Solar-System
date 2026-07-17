import React, { useState } from 'react';
import './SolarCalculator.css';

const SolarCalculator = () => {
  // Appliances Database
  const appliancesList = [
    { id: 1, name: "Ceiling Fan", watts: 75, quantity: 0 },
    { id: 2, name: "LED Lights", watts: 10, quantity: 0 },
    { id: 3, name: "Refrigerator", watts: 150, quantity: 0 },
    { id: 4, name: "Television", watts: 100, quantity: 0 },
    { id: 5, name: "AC (1 Ton)", watts: 1200, quantity: 0 },
    { id: 6, name: "AC (1.5 Ton)", watts: 1800, quantity: 0 },
    { id: 7, name: "Washing Machine", watts: 500, quantity: 0 },
    { id: 8, name: "Water Pump", watts: 750, quantity: 0 },
    { id: 9, name: "Electric Iron", watts: 1000, quantity: 0 },
    { id: 10, name: "Computer", watts: 100, quantity: 0 },
    { id: 11, name: "Chargers", watts: 10, quantity: 0 },
    { id: 12, name: "Geyser", watts: 3000, quantity: 0 },
    { id: 13, name: "Room Heater", watts: 1500, quantity: 0 },
    { id: 14, name: "Microwave", watts: 1000, quantity: 0 },
    { id: 15, name: "Air Cooler", watts: 200, quantity: 0 },
    { id: 16, name: "Wifi Devices", watts: 6, quantity: 0 }
  ];

  // Solar Panel Types available in Pakistan
  const panelTypes = [
    { name: "300W Polycrystalline", watts: 300, efficiency: "17%", price: 18000 },
    { name: "330W Polycrystalline", watts: 330, efficiency: "18%", price: 20000 },
    { name: "400W Monocrystalline", watts: 400, efficiency: "20%", price: 25000 },
    { name: "450W Monocrystalline", watts: 450, efficiency: "21%", price: 28000 },
    { name: "500W Monocrystalline", watts: 500, efficiency: "21.5%", price: 32000 },
    { name: "550W Monocrystalline", watts: 550, efficiency: "22%", price: 35000 },
    { name: "600W Bifacial", watts: 600, efficiency: "23%", price: 42000 }
  ];

  const [appliances, setAppliances] = useState(appliancesList);
  const [dailyUsageHours, setDailyUsageHours] = useState(6);
  const [selectedPanel, setSelectedPanel] = useState(panelTypes[3]); // Default 450W
  const [sunHours, setSunHours] = useState(5);
  const [results, setResults] = useState(null);

  // Update appliance quantity
  const updateApplianceQuantity = (id, quantity) => {
    setAppliances(prev => prev.map(appliance => 
      appliance.id === id ? { ...appliance, quantity: parseInt(quantity) || 0 } : appliance
    ));
  };

  // Calculate total consumption
  const calculateConsumption = () => {
    let totalWatts = 0;
    appliances.forEach(appliance => {
      totalWatts += appliance.watts * appliance.quantity;
    });
    return totalWatts;
  };

  // Calculate number of solar plates needed
  const calculateSolarPlates = () => {
    const totalWatts = calculateConsumption();
    const totalDailyConsumption = totalWatts * dailyUsageHours; // Watt-hours
    
    // Required solar panel wattage = Daily consumption / Sun hours
    const requiredSolarWattage = totalDailyConsumption / sunHours;
    
    // Number of panels = Required wattage / Panel wattage
    const numberOfPanels = Math.ceil(requiredSolarWattage / selectedPanel.watts);
    
    // Add 20% buffer for system losses
    const panelsWithBuffer = Math.ceil(numberOfPanels * 1.2);
    
    // Calculate total cost
    const totalCost = panelsWithBuffer * selectedPanel.price;
    
    // Calculate inverter size (should be 25% more than total load)
    const inverterSize = Math.ceil(totalWatts * 1.25 / 1000); // in kW
    
    // Calculate battery requirements (optional)
    const batteryAH = Math.ceil((totalDailyConsumption * 1) / (12 * 0.5)); // For 1 day backup
    
    // Calculate monthly savings
    const monthlyConsumptionKWH = (totalDailyConsumption * 30) / 1000;
    const monthlySavingsPKR = monthlyConsumptionKWH * 35; // PKR 35 per unit
    
    setResults({
      totalWatts,
      totalDailyConsumption: totalDailyConsumption / 1000, // in kWh
      requiredSolarWattage,
      numberOfPanels: panelsWithBuffer,
      panelType: selectedPanel.name,
      panelWattage: selectedPanel.watts,
      inverterSize: `${inverterSize} kW`,
      batteryAH: batteryAH > 0 ? `${batteryAH} AH` : 'Not Required',
      totalCost: totalCost.toLocaleString(),
      monthlySavings: monthlySavingsPKR.toLocaleString(),
      roiMonths: Math.ceil(totalCost / monthlySavingsPKR)
    });
  };

  // Reset all appliances
  const resetAll = () => {
    setAppliances(appliancesList.map(appliance => ({ ...appliance, quantity: 0 })));
    setResults(null);
  };

  // Quick setup presets
  const applyPreset = (presetName) => {
    switch(presetName) {
      case 'smallHome':
        const smallHomePreset = appliances.map(appliance => {
          const quantities = {
            "Ceiling Fan": 3,
            "LED Lights": 10,
            "Refrigerator": 1,
            "Television": 1,
            "Computer": 1,
            "Chargers": 5
          };
          return { ...appliance, quantity: quantities[appliance.name] || 0 };
        });
        setAppliances(smallHomePreset);
        setSelectedPanel(panelTypes[2]); // 400W panel
        setDailyUsageHours(6);
        break;
        
      case 'mediumHome':
        const mediumHomePreset = appliances.map(appliance => {
          const quantities = {
            "Ceiling Fan": 4,
            "LED Lights": 15,
            "Refrigerator": 1,
            "Television": 2,
            "AC (1 Ton)": 1,
            "Washing Machine": 1,
            "Computer": 2,
            "Chargers": 8
          };
          return { ...appliance, quantity: quantities[appliance.name] || 0 };
        });
        setAppliances(mediumHomePreset);
        setSelectedPanel(panelTypes[4]); // 500W panel
        setDailyUsageHours(8);
        break;
        
      case 'largeHome':
        const largeHomePreset = appliances.map(appliance => {
          const quantities = {
            "Ceiling Fan": 6,
            "LED Lights": 20,
            "Refrigerator": 1,
            "Television": 3,
            "AC (1.5 Ton)": 2,
            "Washing Machine": 1,
            "Water Pump": 1,
            "Geyser": 1,
            "Computer": 3,
            "Chargers": 10
          };
          return { ...appliance, quantity: quantities[appliance.name] || 0 };
        });
        setAppliances(largeHomePreset);
        setSelectedPanel(panelTypes[5]); // 550W panel
        setDailyUsageHours(10);
        break;
      default:
        break;
    }
  };

  return (
    <section id="calculator" className="calculator-section glass-panel">
      <h2>🧑‍🚀 Space Grade Solar Plate Calculator for Pakistan</h2>
      <p className="section-subtitle">Calculate the exact energy and solar plates needed for your deep space (or Earth) base</p>
      
      {/* Quick Presets */}
      <div className="presets-section">
        <h3>Quick Setup:</h3>
        <div className="preset-buttons">
          <button onClick={() => applyPreset('smallHome')} className="preset-btn small">
            🏠 Small Home (2-3 Bedroom)
          </button>
          <button onClick={() => applyPreset('mediumHome')} className="preset-btn medium">
            🏡 Medium Home (3-4 Bedroom)
          </button>
          <button onClick={() => applyPreset('largeHome')} className="preset-btn large">
            🏘️ Large Home (5+ Bedroom)
          </button>
        </div>
      </div>
      
      <div className="calculator-container">
        {/* Left Column - Appliances */}
        <div className="appliances-column">
          <h3>⚡ Your Appliances</h3>
          <div className="appliances-grid">
            {appliances.map(appliance => (
              <div key={appliance.id} className="appliance-item">
                <div className="appliance-header">
                  <span className="appliance-name">{appliance.name}</span>
                  <span className="appliance-watts">{appliance.watts}W</span>
                </div>
                <div className="quantity-controls">
                  <button 
                    onClick={() => updateApplianceQuantity(appliance.id, Math.max(0, appliance.quantity - 1))}
                    className="qty-btn minus"
                  >
                    -
                  </button>
                  <span className="quantity-display">{appliance.quantity}</span>
                  <button 
                    onClick={() => updateApplianceQuantity(appliance.id, appliance.quantity + 1)}
                    className="qty-btn plus"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button onClick={resetAll} className="reset-btn">
            🔄 Reset All
          </button>
        </div>
        
        {/* Right Column - Configuration and Results */}
        <div className="config-column">
          <div className="config-card">
            <h3>🔧 Configuration</h3>
            
            <div className="config-item">
              <label>Daily Usage Hours:</label>
              <div className="hours-slider">
                <input
                  type="range"
                  min="2"
                  max="16"
                  step="1"
                  value={dailyUsageHours}
                  onChange={(e) => setDailyUsageHours(parseInt(e.target.value))}
                />
                <span className="hours-value">{dailyUsageHours} hours/day</span>
              </div>
            </div>
            
            <div className="config-item">
              <label>Sunlight Hours (Pakistan):</label>
              <div className="sun-hours">
                <select 
                  value={sunHours}
                  onChange={(e) => setSunHours(parseFloat(e.target.value))}
                  className="sun-select"
                >
                  <option value="4">Karachi: 5.5 hours</option>
                  <option value="4.5">Lahore: 4.5 hours</option>
                  <option value="5">Islamabad: 5 hours</option>
                  <option value="6">Quetta: 6 hours</option>
                  <option value="4">Multan: 4 hours</option>
                </select>
              </div>
            </div>
            
            <div className="config-item">
              <label>Select Solar Plate Type:</label>
              <div className="panel-options">
                {panelTypes.map(panel => (
                  <div 
                    key={panel.name}
                    className={`panel-option ${selectedPanel.name === panel.name ? 'selected' : ''}`}
                    onClick={() => setSelectedPanel(panel)}
                  >
                    <div className="panel-name">{panel.name}</div>
                    <div className="panel-details">
                      <span>⚡ {panel.watts}W</span>
                      <span>📊 {panel.efficiency}</span>
                      <span>💰 PKR {panel.price.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Current Load Summary */}
          <div className="load-summary">
            <h3>📊 Current Load Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">Total Appliances:</span>
                <span className="value">{appliances.filter(a => a.quantity > 0).length}</span>
              </div>
              <div className="summary-item">
                <span className="label">Total Load:</span>
                <span className="value highlight">{calculateConsumption().toLocaleString()} Watts</span>
              </div>
              <div className="summary-item">
                <span className="label">Daily Usage:</span>
                <span className="value">{(calculateConsumption() * dailyUsageHours / 1000).toFixed(1)} kWh</span>
              </div>
              <div className="summary-item">
                <span className="label">Monthly Bill:</span>
                <span className="value">
                  PKR {((calculateConsumption() * dailyUsageHours * 30 * 35) / 1000).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          {/* Calculate Button */}
          <button 
            onClick={calculateSolarPlates} 
            className="calculate-main-btn"
            disabled={calculateConsumption() === 0}
          >
            🚀 Calculate Solar Plates Needed
          </button>
        </div>
      </div>
      
      {/* Results Section */}
      {results && (
        <div className="results-section">
          <h3>📊 Result: Solar System Requirements</h3>
          
          <div className="results-grid">
            <div className="result-card main-result">
              <div className="result-icon">🔋</div>
              <div className="result-content">
                <h4>Total Solar Plates Needed:</h4>
                <div className="result-value">
                  <span className="big-number">{results.numberOfPanels}</span>
                  <span className="unit">plates</span>
                </div>
                <p className="result-detail">
                  {results.panelType} ({results.panelWattage}W each)
                </p>
              </div>
            </div>
            
            <div className="result-card">
              <div className="result-icon">💰</div>
              <div className="result-content">
                <h4>Total Cost:</h4>
                <div className="result-value">PKR {results.totalCost}</div>
                <p className="result-detail">(Plates only, installation extra)</p>
              </div>
            </div>
            
            <div className="result-card">
              <div className="result-icon">⚡</div>
              <div className="result-content">
                <h4>Inverter Required:</h4>
                <div className="result-value">{results.inverterSize}</div>
                <p className="result-detail">Pure Sine Wave recommended</p>
              </div>
            </div>
            
            <div className="result-card">
              <div className="result-icon">💡</div>
              <div className="result-content">
                <h4>Monthly Savings:</h4>
                <div className="result-value">PKR {results.monthlySavings}</div>
                <p className="result-detail">ROI: {results.roiMonths} months</p>
              </div>
            </div>
          </div>
          
          {/* Detailed Breakdown */}
          <div className="detailed-breakdown">
            <h4>📈 Detailed Calculation:</h4>
            <div className="breakdown-steps">
              <div className="step">
                <span className="step-number">1</span>
                <div className="step-content">
                  <strong>Your Daily Consumption:</strong> {results.totalDailyConsumption.toFixed(1)} kWh
                </div>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <div className="step-content">
                  <strong>Required Solar Power:</strong> {results.requiredSolarWattage.toFixed(0)} Watts
                </div>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <div className="step-content">
                  <strong>Panel Calculation:</strong> {results.requiredSolarWattage.toFixed(0)}W ÷ {results.panelWattage}W = {Math.ceil(results.requiredSolarWattage / results.panelWattage)} panels
                </div>
              </div>
              <div className="step">
                <span className="step-number">4</span>
                <div className="step-content">
                  <strong>With 20% Buffer:</strong> {Math.ceil(results.requiredSolarWattage / results.panelWattage)} + 20% = <strong>{results.numberOfPanels} panels</strong>
                </div>
              </div>
            </div>
          </div>
          
          {/* Panel Layout Visualization */}
          <div className="panel-visualization">
            <h4>🏠 How They Fit on Your Roof:</h4>
            <div className="roof-grid">
              {Array.from({ length: results.numberOfPanels }).map((_, index) => (
                <div key={index} className="panel-slot">
                  <div className="panel-visual">
                    ⬛
                  </div>
                  <div className="panel-label">{results.panelWattage}W</div>
                </div>
              ))}
            </div>
            <p className="roof-note">
              ⚠️ Each panel needs ~1.6m × 1m space. Total roof space needed: {(results.numberOfPanels * 1.6).toFixed(1)} square meters
            </p>
          </div>
          
          {/* Next Steps */}
          <div className="next-steps">
            <h4>📞 Next Steps:</h4>
            <div className="steps-grid">
              <div className="step-item">
                <div className="step-icon">1️⃣</div>
                <div className="step-text">Contact solar company with these specifications</div>
              </div>
              <div className="step-item">
                <div className="step-icon">2️⃣</div>
                <div className="step-text">Get site survey for exact placement</div>
              </div>
              <div className="step-item">
                <div className="step-icon">3️⃣</div>
                <div className="step-text">Apply for net metering</div>
              </div>
              <div className="step-item">
                <div className="step-icon">4️⃣</div>
                <div className="step-text">Install and start saving!</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SolarCalculator;