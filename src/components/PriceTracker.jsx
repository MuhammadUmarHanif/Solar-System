import React, { useState, useEffect } from 'react';
import './PriceTracker.css';

const PriceTracker = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // Simulate API call for Pakistani vendors
        setTimeout(() => {
          const pakistaniVendors = [
            { 
              vendor: 'PAK Solar Solutions', 
              city: 'Lahore',
              panelType: 'Monocrystalline', 
              price: 'PKR 45,000/panel', 
              warranty: '25 years',
              rating: '4.7/5',
              capacity: '550W',
              efficiency: '21.5%'
            },
            { 
              vendor: 'SolarTech Pakistan', 
              city: 'Karachi',
              panelType: 'Polycrystalline', 
              price: 'PKR 32,000/panel', 
              warranty: '20 years',
              rating: '4.4/5',
              capacity: '450W',
              efficiency: '18.5%'
            },
            { 
              vendor: 'SunPower Pakistan', 
              city: 'Islamabad',
              panelType: 'Monocrystalline', 
              price: 'PKR 52,000/panel', 
              warranty: '30 years',
              rating: '4.8/5',
              capacity: '600W',
              efficiency: '22.3%'
            },
            { 
              vendor: 'Green Energy Pakistan', 
              city: 'Faisalabad',
              panelType: 'Bifacial', 
              price: 'PKR 65,000/panel', 
              warranty: '25 years',
              rating: '4.6/5',
              capacity: '550W',
              efficiency: '23.1%'
            },
            { 
              vendor: 'Pak China Solar', 
              city: 'Sialkot',
              panelType: 'Thin-Film', 
              price: 'PKR 28,000/panel', 
              warranty: '15 years',
              rating: '4.2/5',
              capacity: '400W',
              efficiency: '16.8%'
            },
            { 
              vendor: 'SolarCity Pakistan', 
              city: 'Rawalpindi',
              panelType: 'Polycrystalline', 
              price: 'PKR 35,000/panel', 
              warranty: '22 years',
              rating: '4.3/5',
              capacity: '500W',
              efficiency: '19.2%'
            },
            { 
              vendor: 'ECO Solar Pakistan', 
              city: 'Multan',
              panelType: 'Monocrystalline', 
              price: 'PKR 48,000/panel', 
              warranty: '25 years',
              rating: '4.5/5',
              capacity: '550W',
              efficiency: '21.8%'
            },
            { 
              vendor: 'Bright Solar Pakistan', 
              city: 'Gujranwala',
              panelType: 'Polycrystalline', 
              price: 'PKR 30,000/panel', 
              warranty: '20 years',
              rating: '4.1/5',
              capacity: '450W',
              efficiency: '18.2%'
            }
          ];
          
          setPrices(pakistaniVendors);
          setLoading(false);
          setLastUpdated(new Date().toLocaleString('en-PK', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }));
        }, 1500);
      } catch (err) {
        setError('Failed to fetch price data');
        setLoading(false);
      }
    };

    fetchPrices();
    // Refresh every 5 minutes
    const interval = setInterval(fetchPrices, 300000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="tracker" className="tracker-section">
      <h2>Live Price Tracker</h2>
      <div className="tracker-header">
        <p>Real-time prices from Pakistani vendors in PKR</p>
        {lastUpdated && (
          <div className="update-time">
            <span className="update-icon">🔄</span>
            Last updated: {lastUpdated}
          </div>
        )}
      </div>
      
      <div id="price-list" className="price-list">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Fetching real-time data from Pakistani vendors...</p>
          </div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <table className="price-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>City</th>
                  <th>Panel Type</th>
                  <th>Capacity</th>
                  <th>Price (PKR)</th>
                  <th>Efficiency</th>
                  <th>Warranty</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                    <td className="vendor-name">{item.vendor}</td>
                    <td className="city-cell">{item.city}</td>
                    <td>{item.panelType}</td>
                    <td>{item.capacity}</td>
                    <td className="price-cell">{item.price}</td>
                    <td className="efficiency-cell">{item.efficiency}</td>
                    <td>{item.warranty}</td>
                    <td className="rating-cell">
                      <span className="stars">{"⭐".repeat(Math.floor(parseFloat(item.rating)))}</span>
                      {item.rating}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="price-summary">
              <div className="summary-card">
                <h4>Average Panel Prices in Pakistan</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Monocrystalline:</span>
                    <span className="summary-value">PKR 48,300</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Polycrystalline:</span>
                    <span className="summary-value">PKR 32,300</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Thin-Film:</span>
                    <span className="summary-value">PKR 28,000</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Bifacial:</span>
                    <span className="summary-value">PKR 65,000</span>
                  </div>
                </div>
              </div>
              <div className="info-note">
                <p>💡 <strong>Note:</strong> Prices include 17% GST. Installation costs extra (PKR 15,000-25,000 per kW).</p>
                <p>🎯 <strong>Best Value:</strong> Polycrystalline panels offer best price-performance ratio for Pakistan's climate.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default PriceTracker;